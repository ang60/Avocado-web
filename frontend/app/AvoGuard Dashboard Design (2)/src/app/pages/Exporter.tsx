'use client';

import { Layout } from '../components/Layout';
import { Package, TrendingUp, AlertTriangle, Plus, Truck, CheckCircle, Clock, Eye, Calendar, X, MapPin, Phone, User } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ConsignmentBlock {
  id: string;
  blockId: string;
  farmerName: string;
  county: string;
  acreage: number;
  estimatedVolume: number;
  pestPressure: number;
  phiExpiryDate: string;
  kephisStatus: 'cleared' | 'pending' | 'blocked';
  lastSprayDate: string;
  batchId?: string;
  batchStage?: 'scouting' | 'kephis' | 'packed' | 'shipped';
  phoneNumber?: string;
  location?: string;
}

interface Batch {
  id: string;
  name: string;
  destination: string;
  targetShipDate: string;
  createdDate: string;
  blockIds: string[];
  stage: 'scouting' | 'kephis' | 'packed' | 'shipped';
  totalVolume: number;
}

const mockConsignmentData: ConsignmentBlock[] = [
  {
    id: '1',
    blockId: 'BLK-KRN-2401',
    farmerName: 'Peter Kamau',
    county: 'Kiambu',
    acreage: 12.5,
    estimatedVolume: 15.2,
    pestPressure: 8,
    phiExpiryDate: '2026-03-20',
    kephisStatus: 'cleared',
    lastSprayDate: '2026-03-10',
    batchId: 'BATCH-001',
    batchStage: 'kephis',
    phoneNumber: '+254 722 456 789',
    location: 'Kiambu, Gatundu South',
  },
  {
    id: '2',
    blockId: 'BLK-MRU-1856',
    farmerName: 'Grace Wanjiku',
    county: 'Murang\'a',
    acreage: 18.3,
    estimatedVolume: 22.5,
    pestPressure: 5,
    phiExpiryDate: '2026-03-22',
    kephisStatus: 'cleared',
    lastSprayDate: '2026-03-08',
    batchId: 'BATCH-001',
    batchStage: 'kephis',
    phoneNumber: '+254 733 567 890',
    location: 'Murang\'a, Kigumo',
  },
  {
    id: '3',
    blockId: 'BLK-NKR-3312',
    farmerName: 'James Mwangi',
    county: 'Nakuru',
    acreage: 8.7,
    estimatedVolume: 10.8,
    pestPressure: 12,
    phiExpiryDate: '2026-03-25',
    kephisStatus: 'pending',
    lastSprayDate: '2026-03-12',
    batchId: 'BATCH-002',
    batchStage: 'scouting',
    phoneNumber: '+254 711 234 567',
    location: 'Nakuru, Njoro',
  },
  {
    id: '4',
    blockId: 'BLK-NYR-4521',
    farmerName: 'Lucy Akinyi',
    county: 'Nyeri',
    acreage: 15.0,
    estimatedVolume: 18.5,
    pestPressure: 3,
    phiExpiryDate: '2026-03-19',
    kephisStatus: 'cleared',
    lastSprayDate: '2026-03-05',
    batchId: 'BATCH-001',
    batchStage: 'kephis',
    phoneNumber: '+254 720 345 678',
    location: 'Nyeri, Kieni',
  },
  {
    id: '5',
    blockId: 'BLK-KRN-8834',
    farmerName: 'David Omondi',
    county: 'Kiambu',
    acreage: 22.1,
    estimatedVolume: 28.3,
    pestPressure: 18,
    phiExpiryDate: '2026-03-28',
    kephisStatus: 'blocked',
    lastSprayDate: '2026-03-14',
    phoneNumber: '+254 734 678 901',
    location: 'Kiambu, Limuru',
  },
  {
    id: '6',
    blockId: 'BLK-MRU-7723',
    farmerName: 'Sarah Njeri',
    county: 'Murang\'a',
    acreage: 10.4,
    estimatedVolume: 12.9,
    pestPressure: 7,
    phiExpiryDate: '2026-03-21',
    kephisStatus: 'cleared',
    lastSprayDate: '2026-03-09',
    batchId: 'BATCH-003',
    batchStage: 'packed',
    phoneNumber: '+254 712 789 012',
    location: 'Murang\'a, Kandara',
  },
  {
    id: '7',
    blockId: 'BLK-EMB-5512',
    farmerName: 'John Kipchoge',
    county: 'Embu',
    acreage: 14.8,
    estimatedVolume: 18.0,
    pestPressure: 15,
    phiExpiryDate: '2026-03-30',
    kephisStatus: 'blocked',
    lastSprayDate: '2026-03-15',
    phoneNumber: '+254 721 890 123',
    location: 'Embu, Mbeere North',
  },
  {
    id: '8',
    blockId: 'BLK-KRN-9921',
    farmerName: 'Mary Wambui',
    county: 'Kiambu',
    acreage: 9.2,
    estimatedVolume: 11.3,
    pestPressure: 4,
    phiExpiryDate: '2026-03-23',
    kephisStatus: 'cleared',
    lastSprayDate: '2026-03-11',
    batchId: 'BATCH-002',
    batchStage: 'scouting',
    phoneNumber: '+254 735 901 234',
    location: 'Kiambu, Kikuyu',
  },
];

export function Exporter() {
  const [blocks, setBlocks] = useState<ConsignmentBlock[]>(mockConsignmentData);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [createBatchModalOpen, setCreateBatchModalOpen] = useState(false);
  const [schedulePickupModalOpen, setSchedulePickupModalOpen] = useState(false);
  const [batchSuccessModalOpen, setBatchSuccessModalOpen] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<ConsignmentBlock | null>(null);
  const [selectedBlocksForBatch, setSelectedBlocksForBatch] = useState<Set<string>>(new Set());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [newlyCreatedBatch, setNewlyCreatedBatch] = useState<Batch | null>(null);

  // Pickup form state
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [truckType, setTruckType] = useState('refrigerated');
  const [driverNotes, setDriverNotes] = useState('');

  // Batch form state
  const [batchName, setBatchName] = useState('');
  const [exportDestination, setExportDestination] = useState('');
  const [targetShipDate, setTargetShipDate] = useState('');

  // Update time every minute for countdown timers
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  // Calculate summary statistics
  const totalAcreage = blocks.reduce((sum, block) => sum + block.acreage, 0);
  const exportReadyVolume = blocks
    .filter(b => b.kephisStatus === 'cleared')
    .reduce((sum, block) => sum + block.estimatedVolume, 0);
  const blockedVolume = blocks
    .filter(b => b.kephisStatus === 'blocked')
    .reduce((sum, block) => sum + block.estimatedVolume, 0);

  const clearedCount = blocks.filter(b => b.kephisStatus === 'cleared').length;
  const pendingCount = blocks.filter(b => b.kephisStatus === 'pending').length;
  const blockedCount = blocks.filter(b => b.kephisStatus === 'blocked').length;

  // Calculate days until PHI expiry
  const calculateDaysUntilExpiry = (expiryDate: string): number => {
    const expiry = new Date(expiryDate);
    const today = new Date(currentTime);
    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredBlocks = blocks.filter(block => {
    const matchesSearch = 
      block.blockId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      block.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      block.county.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterStatus === 'all' ||
      block.kephisStatus === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const handleSchedulePickup = (block: ConsignmentBlock) => {
    setSelectedBlock(block);
    setPickupDate('');
    setPickupTime('');
    setTruckType('refrigerated');
    setDriverNotes('');
    setSchedulePickupModalOpen(true);
  };

  const handleConfirmPickup = () => {
    if (!pickupDate || !pickupTime) {
      alert('Please select both date and time for pickup');
      return;
    }

    // Success message
    alert(`✅ Pickup Scheduled Successfully!\n\nBlock: ${selectedBlock?.blockId}\nFarmer: ${selectedBlock?.farmerName}\nPickup Date: ${new Date(pickupDate).toLocaleDateString('en-GB')}\nPickup Time: ${pickupTime}\nEstimated Volume: ${selectedBlock?.estimatedVolume} tonnes\nTruck Type: ${truckType}\n\nThe farmer will be notified via SMS at ${selectedBlock?.phoneNumber}`);
    
    setSchedulePickupModalOpen(false);
    setSelectedBlock(null);
  };

  const handleCreateBatch = () => {
    setSelectedBlocksForBatch(new Set());
    setBatchName('');
    setExportDestination('');
    setTargetShipDate('');
    setCreateBatchModalOpen(true);
  };

  const toggleBlockSelection = (blockId: string) => {
    const newSelection = new Set(selectedBlocksForBatch);
    if (newSelection.has(blockId)) {
      newSelection.delete(blockId);
    } else {
      newSelection.add(blockId);
    }
    setSelectedBlocksForBatch(newSelection);
  };

  const handleConfirmBatch = () => {
    if (selectedBlocksForBatch.size === 0) {
      alert('Please select at least one block for the batch');
      return;
    }

    if (!batchName || !exportDestination || !targetShipDate) {
      alert('Please fill in all batch details');
      return;
    }

    const selectedBlocks = blocks.filter(b => selectedBlocksForBatch.has(b.id));
    const totalVolume = selectedBlocks.reduce((sum, b) => sum + b.estimatedVolume, 0);

    const newBatch: Batch = {
      id: `BATCH-${String(Math.floor(Math.random() * 9000) + 1000).padStart(3, '0')}`,
      name: batchName,
      destination: exportDestination,
      targetShipDate: targetShipDate,
      createdDate: new Date().toISOString(),
      blockIds: Array.from(selectedBlocksForBatch),
      stage: 'scouting',
      totalVolume: totalVolume,
    };

    setBatches([...batches, newBatch]);
    setNewlyCreatedBatch(newBatch);
    setCreateBatchModalOpen(false);
    setBatchSuccessModalOpen(true);
  };

  // Get only cleared blocks for batch creation
  const clearedBlocks = blocks.filter(b => b.kephisStatus === 'cleared');

  return (
    <Layout>
      <div className="p-8" style={{ backgroundColor: '#F7F4EF', minHeight: '100vh' }}>
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 
              className="text-4xl mb-2"
              style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}
            >
              Exporter Consignment Hub
            </h1>
            <p className="text-sm" style={{ color: '#717182', fontFamily: 'IBM Plex Sans, sans-serif' }}>
              Manage export-ready avocado consignments and logistics coordination
            </p>
          </div>
          <button
            onClick={handleCreateBatch}
            className="px-6 py-3 rounded-lg flex items-center gap-2 transition-all hover:opacity-90"
            style={{
              backgroundColor: '#2D6A4F',
              color: '#FFFFFF',
              fontFamily: 'IBM Plex Sans, sans-serif',
              fontWeight: 600,
            }}
          >
            <Plus className="w-5 h-5" />
            Create New Shipment Batch
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Total Contracted Acreage - Blue */}
          <div 
            className="bg-white rounded-lg p-6 shadow-sm"
            style={{ borderTop: '4px solid #3498DB' }}
          >
            <div className="flex items-start justify-between mb-4">
              <div 
                className="p-3 rounded-lg"
                style={{ backgroundColor: 'rgba(52, 152, 219, 0.1)' }}
              >
                <TrendingUp className="w-6 h-6" style={{ color: '#3498DB' }} />
              </div>
              <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: '#EBF5FB', color: '#3498DB' }}>
                Active
              </span>
            </div>
            <p className="text-sm mb-1" style={{ color: '#717182', fontFamily: 'IBM Plex Sans, sans-serif' }}>
              Total Contracted Acreage
            </p>
            <p 
              className="text-3xl font-bold mb-2"
              style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}
            >
              {totalAcreage.toFixed(1)}
              <span className="text-lg ml-1" style={{ color: '#717182' }}>ha</span>
            </p>
            <p className="text-xs" style={{ color: '#717182', fontFamily: 'IBM Plex Sans, sans-serif' }}>
              Across {blocks.length} contracted blocks
            </p>
          </div>

          {/* Export-Ready Volume - Green */}
          <div 
            className="bg-white rounded-lg p-6 shadow-sm"
            style={{ borderTop: '4px solid #2D6A4F' }}
          >
            <div className="flex items-start justify-between mb-4">
              <div 
                className="p-3 rounded-lg"
                style={{ backgroundColor: 'rgba(45, 106, 79, 0.1)' }}
              >
                <CheckCircle className="w-6 h-6" style={{ color: '#2D6A4F' }} />
              </div>
              <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: '#E8F5E9', color: '#2D6A4F' }}>
                {clearedCount} Blocks
              </span>
            </div>
            <p className="text-sm mb-1" style={{ color: '#717182', fontFamily: 'IBM Plex Sans, sans-serif' }}>
              Export-Ready Volume (Est.)
            </p>
            <p 
              className="text-3xl font-bold mb-2"
              style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}
            >
              {exportReadyVolume.toFixed(1)}
              <span className="text-lg ml-1" style={{ color: '#717182' }}>tonnes</span>
            </p>
            <p className="text-xs" style={{ color: '#717182', fontFamily: 'IBM Plex Sans, sans-serif' }}>
              KEPHIS cleared & PHI compliant
            </p>
          </div>

          {/* Blocked/At-Risk Volume - Red */}
          <div 
            className="bg-white rounded-lg p-6 shadow-sm"
            style={{ borderTop: '4px solid #C0392B' }}
          >
            <div className="flex items-start justify-between mb-4">
              <div 
                className="p-3 rounded-lg"
                style={{ backgroundColor: 'rgba(192, 57, 43, 0.1)' }}
              >
                <AlertTriangle className="w-6 h-6" style={{ color: '#C0392B' }} />
              </div>
              <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: '#FADBD8', color: '#C0392B' }}>
                {blockedCount} Blocked
              </span>
            </div>
            <p className="text-sm mb-1" style={{ color: '#717182', fontFamily: 'IBM Plex Sans, sans-serif' }}>
              Blocked/At-Risk Volume
            </p>
            <p 
              className="text-3xl font-bold mb-2"
              style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}
            >
              {blockedVolume.toFixed(1)}
              <span className="text-lg ml-1" style={{ color: '#717182' }}>tonnes</span>
            </p>
            <p className="text-xs" style={{ color: '#717182', fontFamily: 'IBM Plex Sans, sans-serif' }}>
              High pest pressure or KEPHIS blocked
            </p>
          </div>
        </div>

        {/* Batch Progress Component */}
        <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
          <h3 
            className="text-lg font-bold mb-6"
            style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}
          >
            <Package className="w-5 h-5 inline mr-2" style={{ color: '#2D6A4F' }} />
            Active Batch Progress - BATCH-001
          </h3>
          
          {/* Progress Bar */}
          <div className="relative">
            {/* Background Track */}
            <div className="absolute top-6 left-0 right-0 h-1" style={{ backgroundColor: '#E0DDD6' }} />
            
            {/* Progress Fill */}
            <div 
              className="absolute top-6 left-0 h-1"
              style={{ 
                backgroundColor: '#2D6A4F',
                width: '50%', // 2 out of 4 stages complete
              }}
            />
            
            {/* Stage Markers */}
            <div className="relative flex justify-between">
              {/* Stage 1: Scouting */}
              <div className="flex flex-col items-center" style={{ width: '25%' }}>
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-3 border-4"
                  style={{ 
                    backgroundColor: '#2D6A4F',
                    borderColor: '#FFFFFF',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                >
                  <CheckCircle className="w-6 h-6" style={{ color: '#FFFFFF' }} />
                </div>
                <p className="text-sm font-semibold mb-1" style={{ color: '#2D6A4F', fontFamily: 'IBM Plex Sans, sans-serif' }}>
                  Scouting
                </p>
                <p className="text-xs text-center" style={{ color: '#717182', fontFamily: 'IBM Plex Sans, sans-serif' }}>
                  Completed
                </p>
              </div>

              {/* Stage 2: KEPHIS Clearance */}
              <div className="flex flex-col items-center" style={{ width: '25%' }}>
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-3 border-4"
                  style={{ 
                    backgroundColor: '#F39C12',
                    borderColor: '#FFFFFF',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                >
                  <Clock className="w-6 h-6" style={{ color: '#FFFFFF' }} />
                </div>
                <p className="text-sm font-semibold mb-1" style={{ color: '#F39C12', fontFamily: 'IBM Plex Sans, sans-serif' }}>
                  KEPHIS Clearance
                </p>
                <p className="text-xs text-center" style={{ color: '#717182', fontFamily: 'IBM Plex Sans, sans-serif' }}>
                  In Progress (3 blocks)
                </p>
              </div>

              {/* Stage 3: Packed */}
              <div className="flex flex-col items-center" style={{ width: '25%' }}>
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-3 border-4"
                  style={{ 
                    backgroundColor: '#E0DDD6',
                    borderColor: '#FFFFFF',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                >
                  <Package className="w-6 h-6" style={{ color: '#717182' }} />
                </div>
                <p className="text-sm font-semibold mb-1" style={{ color: '#717182', fontFamily: 'IBM Plex Sans, sans-serif' }}>
                  Packed
                </p>
                <p className="text-xs text-center" style={{ color: '#717182', fontFamily: 'IBM Plex Sans, sans-serif' }}>
                  Pending
                </p>
              </div>

              {/* Stage 4: Shipped */}
              <div className="flex flex-col items-center" style={{ width: '25%' }}>
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-3 border-4"
                  style={{ 
                    backgroundColor: '#E0DDD6',
                    borderColor: '#FFFFFF',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                >
                  <Truck className="w-6 h-6" style={{ color: '#717182' }} />
                </div>
                <p className="text-sm font-semibold mb-1" style={{ color: '#717182', fontFamily: 'IBM Plex Sans, sans-serif' }}>
                  Shipped
                </p>
                <p className="text-xs text-center" style={{ color: '#717182', fontFamily: 'IBM Plex Sans, sans-serif' }}>
                  Pending
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search by Block ID, Farmer, or County..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border"
                  style={{
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    borderColor: '#E0DDD6',
                    outline: 'none',
                  }}
                />
                <Eye className="w-4 h-4 absolute left-3 top-3" style={{ color: '#717182' }} />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 rounded-lg border"
                style={{
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  borderColor: '#E0DDD6',
                  outline: 'none',
                }}
              >
                <option value="all">All Statuses</option>
                <option value="cleared">Export Cleared</option>
                <option value="pending">KEPHIS Pending</option>
                <option value="blocked">Blocked/At-Risk</option>
              </select>
            </div>

            <div className="text-sm" style={{ color: '#717182', fontFamily: 'IBM Plex Sans, sans-serif' }}>
              Showing {filteredBlocks.length} of {blocks.length} blocks
            </div>
          </div>
        </div>

        {/* Main Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: '#1B4332' }}>
                  <th 
                    className="p-4 text-left text-xs font-semibold uppercase"
                    style={{ color: '#FFFFFF', fontFamily: 'IBM Plex Sans, sans-serif' }}
                  >
                    Block ID
                  </th>
                  <th 
                    className="p-4 text-left text-xs font-semibold uppercase"
                    style={{ color: '#FFFFFF', fontFamily: 'IBM Plex Sans, sans-serif' }}
                  >
                    Farmer Name
                  </th>
                  <th 
                    className="p-4 text-left text-xs font-semibold uppercase"
                    style={{ color: '#FFFFFF', fontFamily: 'IBM Plex Sans, sans-serif' }}
                  >
                    County
                  </th>
                  <th 
                    className="p-4 text-left text-xs font-semibold uppercase"
                    style={{ color: '#FFFFFF', fontFamily: 'IBM Plex Sans, sans-serif' }}
                  >
                    Est. Volume
                  </th>
                  <th 
                    className="p-4 text-left text-xs font-semibold uppercase"
                    style={{ color: '#FFFFFF', fontFamily: 'IBM Plex Sans, sans-serif' }}
                  >
                    Current Pest Pressure (%)
                  </th>
                  <th 
                    className="p-4 text-left text-xs font-semibold uppercase"
                    style={{ color: '#FFFFFF', fontFamily: 'IBM Plex Sans, sans-serif' }}
                  >
                    PHI Expiry Date
                  </th>
                  <th 
                    className="p-4 text-left text-xs font-semibold uppercase"
                    style={{ color: '#FFFFFF', fontFamily: 'IBM Plex Sans, sans-serif' }}
                  >
                    KEPHIS Status
                  </th>
                  <th 
                    className="p-4 text-left text-xs font-semibold uppercase"
                    style={{ color: '#FFFFFF', fontFamily: 'IBM Plex Sans, sans-serif' }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredBlocks.map((block, index) => {
                  const daysUntilExpiry = calculateDaysUntilExpiry(block.phiExpiryDate);
                  const isExpiringAgainstSoon = daysUntilExpiry <= 3 && daysUntilExpiry > 0;
                  const isExpired = daysUntilExpiry < 0;
                  
                  return (
                    <tr 
                      key={block.id}
                      style={{ 
                        backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F7F4EF',
                        borderBottom: '1px solid #E0DDD6',
                      }}
                    >
                      <td className="p-4">
                        <span 
                          style={{ 
                            fontFamily: 'IBM Plex Mono, monospace',
                            fontSize: '13px',
                            color: '#1B4332',
                            fontWeight: 600,
                          }}
                        >
                          {block.blockId}
                        </span>
                      </td>
                      <td className="p-4">
                        <span style={{ color: '#2C2C2E', fontSize: '14px', fontFamily: 'IBM Plex Sans, sans-serif' }}>
                          {block.farmerName}
                        </span>
                      </td>
                      <td className="p-4">
                        <span style={{ color: '#717182', fontSize: '14px', fontFamily: 'IBM Plex Sans, sans-serif' }}>
                          {block.county}
                        </span>
                      </td>
                      <td className="p-4">
                        <span 
                          style={{ 
                            fontFamily: 'IBM Plex Mono, monospace',
                            fontSize: '14px',
                            color: '#1B4332',
                            fontWeight: 600,
                          }}
                        >
                          {block.estimatedVolume.toFixed(1)} t
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                            <div 
                              className="h-2 rounded-full"
                              style={{ 
                                width: `${block.pestPressure}%`,
                                backgroundColor: block.pestPressure >= 15 ? '#C0392B' : block.pestPressure >= 10 ? '#F39C12' : '#2D6A4F',
                              }}
                            />
                          </div>
                          <span 
                            className="font-semibold"
                            style={{ 
                              fontFamily: 'IBM Plex Mono, monospace',
                              fontSize: '13px',
                              color: block.pestPressure >= 15 ? '#C0392B' : block.pestPressure >= 10 ? '#F39C12' : '#2D6A4F',
                            }}
                          >
                            {block.pestPressure}%
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p 
                            style={{ 
                              fontFamily: 'IBM Plex Mono, monospace',
                              fontSize: '13px',
                              color: isExpired ? '#C0392B' : isExpiringAgainstSoon ? '#F39C12' : '#2C2C2E',
                              fontWeight: 600,
                            }}
                          >
                            {new Date(block.phiExpiryDate).toLocaleDateString('en-GB')}
                          </p>
                          <p 
                            className="text-xs mt-1"
                            style={{ 
                              fontFamily: 'IBM Plex Mono, monospace',
                              color: isExpired ? '#C0392B' : isExpiringAgainstSoon ? '#F39C12' : '#717182',
                            }}
                          >
                            {isExpired ? 'EXPIRED' : daysUntilExpiry === 0 ? 'EXPIRES TODAY' : `${daysUntilExpiry}d remaining`}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span 
                          className="px-3 py-1 rounded-full text-xs font-semibold"
                          style={{ 
                            backgroundColor: 
                              block.kephisStatus === 'cleared' ? '#2D6A4F' :
                              block.kephisStatus === 'pending' ? '#F39C12' :
                              '#C0392B',
                            color: '#FFFFFF',
                            fontFamily: 'IBM Plex Sans, sans-serif',
                          }}
                        >
                          {block.kephisStatus === 'cleared' ? 'Export Cleared' :
                           block.kephisStatus === 'pending' ? 'KEPHIS Pending' :
                           'Blocked'}
                        </span>
                      </td>
                      <td className="p-4">
                        {block.kephisStatus === 'cleared' ? (
                          <button
                            onClick={() => handleSchedulePickup(block)}
                            className="px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
                            style={{
                              backgroundColor: '#2D6A4F',
                              color: '#FFFFFF',
                              fontFamily: 'IBM Plex Sans, sans-serif',
                              fontSize: '13px',
                              fontWeight: 600,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#1B4332';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#2D6A4F';
                            }}
                          >
                            <Truck className="w-4 h-4" />
                            Schedule Pickup
                          </button>
                        ) : (
                          <button
                            disabled
                            className="px-4 py-2 rounded-lg flex items-center gap-2 cursor-not-allowed"
                            style={{
                              backgroundColor: '#E0DDD6',
                              color: '#717182',
                              fontFamily: 'IBM Plex Sans, sans-serif',
                              fontSize: '13px',
                              opacity: 0.6,
                            }}
                          >
                            <Calendar className="w-4 h-4" />
                            Pending Clearance
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Schedule Pickup Modal */}
        {schedulePickupModalOpen && selectedBlock && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSchedulePickupModalOpen(false)}
          >
            <div 
              className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
              style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between" style={{ borderColor: '#E0DDD6' }}>
                <div>
                  <h2 
                    className="text-2xl font-bold mb-1"
                    style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}
                  >
                    Schedule Pickup
                  </h2>
                  <p className="text-sm" style={{ color: '#717182' }}>
                    Arrange collection for export-ready consignment
                  </p>
                </div>
                <button
                  onClick={() => setSchedulePickupModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <X className="w-5 h-5" style={{ color: '#717182' }} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {/* Block Details Summary */}
                <div className="bg-green-50 rounded-lg p-4 mb-6" style={{ backgroundColor: 'rgba(45, 106, 79, 0.05)' }}>
                  <h3 className="font-semibold mb-3" style={{ color: '#1B4332', fontSize: '14px' }}>
                    Block Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs mb-1" style={{ color: '#717182' }}>Block ID</p>
                      <p className="font-semibold" style={{ fontFamily: 'IBM Plex Mono, monospace', color: '#1B4332' }}>
                        {selectedBlock.blockId}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs mb-1" style={{ color: '#717182' }}>Farmer</p>
                      <p className="font-semibold" style={{ color: '#2C2C2E' }}>
                        {selectedBlock.farmerName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs mb-1" style={{ color: '#717182' }}>Location</p>
                      <p className="font-semibold flex items-center gap-1" style={{ color: '#2C2C2E' }}>
                        <MapPin className="w-3 h-3" />
                        {selectedBlock.location}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs mb-1" style={{ color: '#717182' }}>Phone</p>
                      <p className="font-semibold flex items-center gap-1" style={{ color: '#2C2C2E' }}>
                        <Phone className="w-3 h-3" />
                        {selectedBlock.phoneNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs mb-1" style={{ color: '#717182' }}>Estimated Volume</p>
                      <p className="font-bold" style={{ fontFamily: 'IBM Plex Mono, monospace', color: '#2D6A4F', fontSize: '16px' }}>
                        {selectedBlock.estimatedVolume.toFixed(1)} tonnes
                      </p>
                    </div>
                    <div>
                      <p className="text-xs mb-1" style={{ color: '#717182' }}>KEPHIS Status</p>
                      <span className="px-2 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#2D6A4F', color: '#FFFFFF' }}>
                        Export Cleared
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pickup Form */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: '#1B4332' }}>
                        Pickup Date *
                      </label>
                      <input
                        type="date"
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-2 rounded-lg border"
                        style={{
                          fontFamily: 'IBM Plex Sans, sans-serif',
                          borderColor: '#E0DDD6',
                          outline: 'none',
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: '#1B4332' }}>
                        Pickup Time *
                      </label>
                      <input
                        type="time"
                        value={pickupTime}
                        onChange={(e) => setPickupTime(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border"
                        style={{
                          fontFamily: 'IBM Plex Sans, sans-serif',
                          borderColor: '#E0DDD6',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#1B4332' }}>
                      Truck Type
                    </label>
                    <select
                      value={truckType}
                      onChange={(e) => setTruckType(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border"
                      style={{
                        fontFamily: 'IBM Plex Sans, sans-serif',
                        borderColor: '#E0DDD6',
                        outline: 'none',
                      }}
                    >
                      <option value="refrigerated">Refrigerated Truck (Recommended)</option>
                      <option value="standard">Standard Covered Truck</option>
                      <option value="open">Open Flatbed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#1B4332' }}>
                      Driver Notes (Optional)
                    </label>
                    <textarea
                      value={driverNotes}
                      onChange={(e) => setDriverNotes(e.target.value)}
                      placeholder="Special instructions for the driver (e.g., gate access, road conditions)..."
                      rows={3}
                      className="w-full px-4 py-2 rounded-lg border resize-none"
                      style={{
                        fontFamily: 'IBM Plex Sans, sans-serif',
                        borderColor: '#E0DDD6',
                        outline: 'none',
                      }}
                    />
                  </div>

                  {/* Info Box */}
                  <div className="bg-blue-50 rounded-lg p-4" style={{ backgroundColor: 'rgba(52, 152, 219, 0.05)', border: '1px solid rgba(52, 152, 219, 0.2)' }}>
                    <p className="text-sm" style={{ color: '#3498DB' }}>
                      <strong>Note:</strong> An SMS notification will be sent to {selectedBlock.farmerName} at {selectedBlock.phoneNumber} confirming the pickup schedule.
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-white border-t p-6 flex justify-end gap-4" style={{ borderColor: '#E0DDD6' }}>
                <button
                  onClick={() => setSchedulePickupModalOpen(false)}
                  className="px-6 py-2 rounded-lg border transition-all hover:bg-gray-50"
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E0DDD6',
                    color: '#1B4332',
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    fontWeight: 600,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmPickup}
                  className="px-6 py-2 rounded-lg flex items-center gap-2 transition-all hover:opacity-90"
                  style={{
                    backgroundColor: '#2D6A4F',
                    color: '#FFFFFF',
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    fontWeight: 600,
                  }}
                >
                  <Truck className="w-4 h-4" />
                  Confirm Pickup Schedule
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Batch Modal */}
        {createBatchModalOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setCreateBatchModalOpen(false)}
          >
            <div 
              className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
              style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between" style={{ borderColor: '#E0DDD6' }}>
                <div>
                  <h2 
                    className="text-2xl font-bold mb-1"
                    style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}
                  >
                    Create New Shipment Batch
                  </h2>
                  <p className="text-sm" style={{ color: '#717182' }}>
                    Select export-cleared blocks to create a coordinated shipment batch
                  </p>
                </div>
                <button
                  onClick={() => setCreateBatchModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <X className="w-5 h-5" style={{ color: '#717182' }} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {/* Batch Details Form */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-4" style={{ color: '#1B4332', fontSize: '16px' }}>
                    Batch Information
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: '#1B4332' }}>
                        Batch Name *
                      </label>
                      <input
                        type="text"
                        value={batchName}
                        onChange={(e) => setBatchName(e.target.value)}
                        placeholder="e.g., MARCH-EXPORT-EU"
                        className="w-full px-4 py-2 rounded-lg border"
                        style={{
                          fontFamily: 'IBM Plex Sans, sans-serif',
                          borderColor: '#E0DDD6',
                          outline: 'none',
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: '#1B4332' }}>
                        Export Destination *
                      </label>
                      <select
                        value={exportDestination}
                        onChange={(e) => setExportDestination(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border"
                        style={{
                          fontFamily: 'IBM Plex Sans, sans-serif',
                          borderColor: '#E0DDD6',
                          outline: 'none',
                        }}
                      >
                        <option value="">Select destination...</option>
                        <option value="EU - Netherlands">EU - Netherlands</option>
                        <option value="EU - Germany">EU - Germany</option>
                        <option value="EU - France">EU - France</option>
                        <option value="UK - London">UK - London</option>
                        <option value="Middle East - Dubai">Middle East - Dubai</option>
                        <option value="Asia - China">Asia - China</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: '#1B4332' }}>
                        Target Ship Date *
                      </label>
                      <input
                        type="date"
                        value={targetShipDate}
                        onChange={(e) => setTargetShipDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-2 rounded-lg border"
                        style={{
                          fontFamily: 'IBM Plex Sans, sans-serif',
                          borderColor: '#E0DDD6',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Selection Summary */}
                {selectedBlocksForBatch.size > 0 && (
                  <div className="bg-green-50 rounded-lg p-4 mb-4" style={{ backgroundColor: 'rgba(45, 106, 79, 0.05)' }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold" style={{ color: '#2D6A4F' }}>
                          {selectedBlocksForBatch.size} blocks selected
                        </p>
                        <p className="text-xs mt-1" style={{ color: '#717182' }}>
                          Total volume: {blocks.filter(b => selectedBlocksForBatch.has(b.id)).reduce((sum, b) => sum + b.estimatedVolume, 0).toFixed(1)} tonnes
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedBlocksForBatch(new Set())}
                        className="text-xs px-3 py-1 rounded-lg hover:bg-white transition-all"
                        style={{ color: '#2D6A4F', fontWeight: 600 }}
                      >
                        Clear Selection
                      </button>
                    </div>
                  </div>
                )}

                {/* Available Blocks */}
                <div>
                  <h3 className="font-semibold mb-3" style={{ color: '#1B4332', fontSize: '16px' }}>
                    Select Export-Cleared Blocks
                  </h3>
                  
                  {clearedBlocks.length === 0 ? (
                    <div className="text-center py-8" style={{ color: '#717182' }}>
                      <AlertTriangle className="w-12 h-12 mx-auto mb-3" style={{ color: '#F39C12' }} />
                      <p>No export-cleared blocks available</p>
                    </div>
                  ) : (
                    <div className="border rounded-lg overflow-hidden" style={{ borderColor: '#E0DDD6' }}>
                      <table className="w-full">
                        <thead>
                          <tr style={{ backgroundColor: '#F7F4EF' }}>
                            <th className="p-3 text-left text-xs font-semibold" style={{ color: '#1B4332' }}>
                              <input
                                type="checkbox"
                                checked={selectedBlocksForBatch.size === clearedBlocks.length && clearedBlocks.length > 0}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedBlocksForBatch(new Set(clearedBlocks.map(b => b.id)));
                                  } else {
                                    setSelectedBlocksForBatch(new Set());
                                  }
                                }}
                                className="w-4 h-4 cursor-pointer"
                              />
                            </th>
                            <th className="p-3 text-left text-xs font-semibold" style={{ color: '#1B4332' }}>Block ID</th>
                            <th className="p-3 text-left text-xs font-semibold" style={{ color: '#1B4332' }}>Farmer</th>
                            <th className="p-3 text-left text-xs font-semibold" style={{ color: '#1B4332' }}>County</th>
                            <th className="p-3 text-left text-xs font-semibold" style={{ color: '#1B4332' }}>Volume</th>
                            <th className="p-3 text-left text-xs font-semibold" style={{ color: '#1B4332' }}>PHI Expiry</th>
                          </tr>
                        </thead>
                        <tbody>
                          {clearedBlocks.map((block, index) => {
                            const daysUntilExpiry = calculateDaysUntilExpiry(block.phiExpiryDate);
                            return (
                              <tr 
                                key={block.id}
                                style={{ 
                                  backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F7F4EF',
                                  borderBottom: '1px solid #E0DDD6',
                                }}
                              >
                                <td className="p-3">
                                  <input
                                    type="checkbox"
                                    checked={selectedBlocksForBatch.has(block.id)}
                                    onChange={() => toggleBlockSelection(block.id)}
                                    className="w-4 h-4 cursor-pointer"
                                  />
                                </td>
                                <td className="p-3">
                                  <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '13px', color: '#1B4332', fontWeight: 600 }}>
                                    {block.blockId}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <span style={{ color: '#2C2C2E', fontSize: '13px' }}>
                                    {block.farmerName}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <span style={{ color: '#717182', fontSize: '13px' }}>
                                    {block.county}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '13px', color: '#1B4332', fontWeight: 600 }}>
                                    {block.estimatedVolume.toFixed(1)} t
                                  </span>
                                </td>
                                <td className="p-3">
                                  <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '12px', color: daysUntilExpiry <= 3 ? '#F39C12' : '#717182' }}>
                                    {daysUntilExpiry}d remaining
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-white border-t p-6 flex justify-end gap-4" style={{ borderColor: '#E0DDD6' }}>
                <button
                  onClick={() => setCreateBatchModalOpen(false)}
                  className="px-6 py-2 rounded-lg border transition-all hover:bg-gray-50"
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E0DDD6',
                    color: '#1B4332',
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    fontWeight: 600,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmBatch}
                  className="px-6 py-2 rounded-lg flex items-center gap-2 transition-all hover:opacity-90"
                  style={{
                    backgroundColor: '#2D6A4F',
                    color: '#FFFFFF',
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    fontWeight: 600,
                  }}
                >
                  <Package className="w-4 h-4" />
                  Create Batch ({selectedBlocksForBatch.size})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Batch Success Modal */}
        {batchSuccessModalOpen && newlyCreatedBatch && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setBatchSuccessModalOpen(false)}
          >
            <div 
              className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
              style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between" style={{ borderColor: '#E0DDD6' }}>
                <div>
                  <h2 
                    className="text-2xl font-bold mb-1"
                    style={{ fontFamily: 'DM Serif Display, serif', color: '#1B4332' }}
                  >
                    Batch Created Successfully
                  </h2>
                  <p className="text-sm" style={{ color: '#717182' }}>
                    Your new shipment batch is ready for further coordination
                  </p>
                </div>
                <button
                  onClick={() => setBatchSuccessModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <X className="w-5 h-5" style={{ color: '#717182' }} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {/* Batch Details Summary */}
                <div className="bg-green-50 rounded-lg p-4 mb-6" style={{ backgroundColor: 'rgba(45, 106, 79, 0.05)' }}>
                  <h3 className="font-semibold mb-3" style={{ color: '#1B4332', fontSize: '14px' }}>
                    Batch Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs mb-1" style={{ color: '#717182' }}>Batch Name</p>
                      <p className="font-semibold" style={{ fontFamily: 'IBM Plex Mono, monospace', color: '#1B4332' }}>
                        {newlyCreatedBatch.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs mb-1" style={{ color: '#717182' }}>Destination</p>
                      <p className="font-semibold" style={{ color: '#2C2C2E' }}>
                        {newlyCreatedBatch.destination}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs mb-1" style={{ color: '#717182' }}>Target Ship Date</p>
                      <p className="font-semibold" style={{ fontFamily: 'IBM Plex Mono, monospace', color: '#1B4332' }}>
                        {new Date(newlyCreatedBatch.targetShipDate).toLocaleDateString('en-GB')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs mb-1" style={{ color: '#717182' }}>Total Volume</p>
                      <p className="font-bold" style={{ fontFamily: 'IBM Plex Mono, monospace', color: '#2D6A4F', fontSize: '16px' }}>
                        {newlyCreatedBatch.totalVolume.toFixed(1)} tonnes
                      </p>
                    </div>
                    <div>
                      <p className="text-xs mb-1" style={{ color: '#717182' }}>Blocks Included</p>
                      <p className="font-semibold" style={{ color: '#2D6A4F' }}>
                        {newlyCreatedBatch.blockIds.length} blocks
                      </p>
                    </div>
                  </div>
                </div>

                {/* Next Steps */}
                <div className="bg-blue-50 rounded-lg p-4" style={{ backgroundColor: 'rgba(52, 152, 219, 0.05)', border: '1px solid rgba(52, 152, 219, 0.2)' }}>
                  <p className="text-sm" style={{ color: '#3498DB' }}>
                    <strong>Next Steps:</strong> Proceed to KEPHIS clearance documentation and schedule pickups for the selected blocks.
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-white border-t p-6 flex justify-end gap-4" style={{ borderColor: '#E0DDD6' }}>
                <button
                  onClick={() => setBatchSuccessModalOpen(false)}
                  className="px-6 py-2 rounded-lg border transition-all hover:bg-gray-50"
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E0DDD6',
                    color: '#1B4332',
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    fontWeight: 600,
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}