import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

interface CountyData {
  name: string;
  cases: number;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  farms: number;
  activeOutbreaks: number;
}

const countyData: Record<string, CountyData> = {
  "Murang'a": { name: "Murang'a County", cases: 45, riskLevel: 'critical', farms: 24, activeOutbreaks: 3 },
  "Kiambu": { name: "Kiambu County", cases: 28, riskLevel: 'high', farms: 18, activeOutbreaks: 2 },
  "Meru": { name: "Meru County", cases: 19, riskLevel: 'medium', farms: 12, activeOutbreaks: 1 },
  "Nyeri": { name: "Nyeri County", cases: 14, riskLevel: 'medium', farms: 9, activeOutbreaks: 1 },
  "Embu": { name: "Embu County", cases: 8, riskLevel: 'low', farms: 6, activeOutbreaks: 0 },
  "Bungoma": { name: "Bungoma County", cases: 12, riskLevel: 'low', farms: 8, activeOutbreaks: 1 },
  "Kakamega": { name: "Kakamega County", cases: 6, riskLevel: 'low', farms: 4, activeOutbreaks: 0 },
  "Trans Nzoia": { name: "Trans Nzoia County", cases: 5, riskLevel: 'low', farms: 3, activeOutbreaks: 0 },
};

const riskColors = {
  critical: '#DC2626',
  high: '#D97706',
  medium: '#FBBF24',
  low: '#74C69D',
};

export function KenyaHeatMap() {
  const [hoveredCounty, setHoveredCounty] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const handleCountyHover = (countyId: string, event: React.MouseEvent<SVGPathElement>) => {
    setHoveredCounty(countyId);
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  };

  const handleCountyLeave = () => {
    setHoveredCounty(null);
  };

  return (
    <div className="relative">
      <svg
        viewBox="0 0 600 700"
        className="w-full h-full"
        style={{ maxHeight: '600px' }}
      >
        {/* Simplified Kenya map with major avocado-growing counties */}
        
        {/* Trans Nzoia - Northwest */}
        <path
          d="M 120 150 L 180 140 L 200 160 L 190 190 L 150 200 L 120 180 Z"
          fill={riskColors[countyData["Trans Nzoia"].riskLevel]}
          stroke="#FFFFFF"
          strokeWidth="2"
          className="cursor-pointer transition-all hover:opacity-80"
          onMouseMove={(e) => handleCountyHover("Trans Nzoia", e)}
          onMouseLeave={handleCountyLeave}
        />
        
        {/* Bungoma - West */}
        <path
          d="M 100 200 L 150 200 L 160 240 L 140 260 L 100 250 Z"
          fill={riskColors[countyData.Bungoma.riskLevel]}
          stroke="#FFFFFF"
          strokeWidth="2"
          className="cursor-pointer transition-all hover:opacity-80"
          onMouseMove={(e) => handleCountyHover("Bungoma", e)}
          onMouseLeave={handleCountyLeave}
        />
        
        {/* Kakamega - West Central */}
        <path
          d="M 140 260 L 160 240 L 180 250 L 190 280 L 160 290 L 140 280 Z"
          fill={riskColors[countyData.Kakamega.riskLevel]}
          stroke="#FFFFFF"
          strokeWidth="2"
          className="cursor-pointer transition-all hover:opacity-80"
          onMouseMove={(e) => handleCountyHover("Kakamega", e)}
          onMouseLeave={handleCountyLeave}
        />
        
        {/* Nyeri - Central */}
        <path
          d="M 280 300 L 340 290 L 360 320 L 350 360 L 300 370 L 270 340 Z"
          fill={riskColors[countyData.Nyeri.riskLevel]}
          stroke="#FFFFFF"
          strokeWidth="2"
          className="cursor-pointer transition-all hover:opacity-80"
          onMouseMove={(e) => handleCountyHover("Nyeri", e)}
          onMouseLeave={handleCountyLeave}
        />
        
        {/* Murang'a - Central */}
        <path
          d="M 300 370 L 350 360 L 380 390 L 370 430 L 320 440 L 290 410 Z"
          fill={riskColors[countyData["Murang'a"].riskLevel]}
          stroke="#FFFFFF"
          strokeWidth="2"
          className="cursor-pointer transition-all hover:opacity-80"
          onMouseMove={(e) => handleCountyHover("Murang'a", e)}
          onMouseLeave={handleCountyLeave}
        />
        
        {/* Kiambu - Central South */}
        <path
          d="M 290 410 L 320 440 L 330 480 L 310 510 L 260 500 L 250 460 Z"
          fill={riskColors[countyData.Kiambu.riskLevel]}
          stroke="#FFFFFF"
          strokeWidth="2"
          className="cursor-pointer transition-all hover:opacity-80"
          onMouseMove={(e) => handleCountyHover("Kiambu", e)}
          onMouseLeave={handleCountyLeave}
        />
        
        {/* Embu - East Central */}
        <path
          d="M 380 390 L 440 380 L 460 410 L 450 450 L 400 460 L 370 430 Z"
          fill={riskColors[countyData.Embu.riskLevel]}
          stroke="#FFFFFF"
          strokeWidth="2"
          className="cursor-pointer transition-all hover:opacity-80"
          onMouseMove={(e) => handleCountyHover("Embu", e)}
          onMouseLeave={handleCountyLeave}
        />
        
        {/* Meru - Northeast Central */}
        <path
          d="M 360 250 L 430 240 L 460 270 L 460 320 L 420 350 L 370 340 Z"
          fill={riskColors[countyData.Meru.riskLevel]}
          stroke="#FFFFFF"
          strokeWidth="2"
          className="cursor-pointer transition-all hover:opacity-80"
          onMouseMove={(e) => handleCountyHover("Meru", e)}
          onMouseLeave={handleCountyLeave}
        />
        
        {/* County Labels */}
        <text x="150" y="175" fontSize="10" fill="#1B4332" fontFamily="IBM Plex Sans, sans-serif" textAnchor="middle">Trans Nzoia</text>
        <text x="120" y="230" fontSize="10" fill="#1B4332" fontFamily="IBM Plex Sans, sans-serif" textAnchor="middle">Bungoma</text>
        <text x="160" y="270" fontSize="10" fill="#1B4332" fontFamily="IBM Plex Sans, sans-serif" textAnchor="middle">Kakamega</text>
        <text x="315" y="330" fontSize="10" fill="#1B4332" fontFamily="IBM Plex Sans, sans-serif" textAnchor="middle">Nyeri</text>
        <text x="335" y="405" fontSize="10" fill="#1B4332" fontFamily="IBM Plex Sans, sans-serif" textAnchor="middle">Murang'a</text>
        <text x="285" y="480" fontSize="10" fill="#1B4332" fontFamily="IBM Plex Sans, sans-serif" textAnchor="middle">Kiambu</text>
        <text x="415" y="420" fontSize="10" fill="#1B4332" fontFamily="IBM Plex Sans, sans-serif" textAnchor="middle">Embu</text>
        <text x="410" y="295" fontSize="10" fill="#1B4332" fontFamily="IBM Plex Sans, sans-serif" textAnchor="middle">Meru</text>
      </svg>

      {/* Tooltip */}
      {hoveredCounty && countyData[hoveredCounty] && (
        <div
          className="absolute z-50 p-4 rounded-lg border shadow-lg"
          style={{
            backgroundColor: '#FFFFFF',
            borderColor: '#E0DDD6',
            borderRadius: '8px',
            left: `${tooltipPosition.x + 20}px`,
            top: `${tooltipPosition.y - 60}px`,
            minWidth: '200px',
            pointerEvents: 'none',
          }}
        >
          <div className="mb-2">
            <h4 className="font-medium" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
              {countyData[hoveredCounty].name}
            </h4>
          </div>
          
          <div className="space-y-1 text-sm">
            <div className="flex items-center justify-between">
              <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>Cases:</span>
              <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                {countyData[hoveredCounty].cases}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>Farms:</span>
              <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                {countyData[hoveredCounty].farms}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>Active Outbreaks:</span>
              <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#1B4332' }}>
                {countyData[hoveredCounty].activeOutbreaks}
              </span>
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: '#E0DDD6' }}>
              <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>Risk Level:</span>
              <span
                className="px-2 py-1 rounded text-xs"
                style={{
                  backgroundColor: `${riskColors[countyData[hoveredCounty].riskLevel]}20`,
                  color: riskColors[countyData[hoveredCounty].riskLevel],
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  borderRadius: '4px',
                }}
              >
                {countyData[hoveredCounty].riskLevel.charAt(0).toUpperCase() + countyData[hoveredCounty].riskLevel.slice(1)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#DC2626' }} />
          <span className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
            Critical
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#D97706' }} />
          <span className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
            High
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FBBF24' }} />
          <span className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
            Medium
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#74C69D' }} />
          <span className="text-xs" style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
            Low
          </span>
        </div>
      </div>
    </div>
  );
}
