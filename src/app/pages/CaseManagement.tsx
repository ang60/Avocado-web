import { Layout } from '../components/Layout';
import { KPICards } from '../components/KPICards';
import { CaseTableEnhanced } from '../components/CaseTableEnhanced';

export function CaseManagement() {
  return (
    <Layout>
      <header className="mb-8">
        <h1 
          className="text-4xl mb-2" 
          style={{ 
            fontFamily: 'DM Serif Display, serif',
            color: '#1B4332'
          }}
        >
          Case Management
        </h1>
        <p style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}>
          Monitor and manage pest and disease cases across all farms
        </p>
      </header>
      <KPICards />
      <CaseTableEnhanced />
    </Layout>
  );
}