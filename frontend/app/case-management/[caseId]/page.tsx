import { CaseDetail } from '../../../src/app/pages/CaseDetail';

export const metadata = {
  title: 'Case Details - AvoGuard',
  description: 'View and manage case details',
};

export default function CaseDetailPage({ params }: { params: { caseId: string } }) {
  return <CaseDetail />;
}
