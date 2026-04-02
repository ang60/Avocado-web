import { BarChart3, ClipboardList, Map } from 'lucide-react';
import type { ReactNode } from 'react';
import avocadoLogo from '../../imports/avocado_logo.svg';

function Feature({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-full bg-green-400/20 flex items-center justify-center">
        <div className="text-green-200">{icon}</div>
      </div>
      <div>
        <h3 className="font-semibold" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
          {title}
        </h3>
        <p className="text-green-200 text-sm" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
          {description}
        </p>
      </div>
    </div>
  );
}

/** Right-hand marketing column used on login and register pages. */
export function AuthBrandingPanel() {
  return (
    <div className="rounded-2xl p-12 bg-gradient-to-b from-[#1f5a3d] to-[#184e35] text-white flex flex-col justify-between min-h-[790px]">
      <div>
        <div className="flex items-center gap-5 mb-10">
          <div className="w-28 h-28 rounded-full bg-white flex items-center justify-center">
            <img src={avocadoLogo} alt="logo" className="w-20 h-20" />
          </div>
          <div>
            <h2 className="text-6xl font-semibold leading-none" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
              AvoGuard
            </h2>
            <p className="mt-2 text-base text-green-200" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
              Pest and Disease Monitoring System
            </p>
          </div>
        </div>

        <div className="space-y-8 mt-10">
          <Feature
            icon={<BarChart3 />}
            title="Real-time Dashboard"
            description="Monitor farms, pest reports, and alerts in real-time"
          />
          <Feature
            icon={<ClipboardList />}
            title="Case Management"
            description="Track, assign, and resolve pest and disease cases efficiently"
          />
          <Feature
            icon={<Map />}
            title="Farmer Insights"
            description="View farm profiles, locations, crops, and historical case data"
          />
        </div>
      </div>

      <div className="flex justify-center gap-2 mt-10">
        <span className="w-2 h-2 rounded-full bg-green-300" />
        <span className="w-2 h-2 rounded-full bg-green-700" />
        <span className="w-2 h-2 rounded-full bg-green-700" />
      </div>
    </div>
  );
}
