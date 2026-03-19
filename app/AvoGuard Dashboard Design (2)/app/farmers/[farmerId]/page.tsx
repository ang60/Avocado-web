import { FarmerDetail } from '../../../src/app/pages/FarmerDetail';

export const metadata = {
  title: 'Farmer Details - AvoGuard',
  description: 'View farmer profile and farm details',
};

export default function FarmerDetailPage({ params }: { params: { farmerId: string } }) {
  return <FarmerDetail />;
}
