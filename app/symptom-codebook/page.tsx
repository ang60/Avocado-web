import { SymptomCodebook } from '../../src/app/pages/SymptomCodebook';

export const metadata = {
  title: 'Symptom Codebook - AvoGuard',
  description: 'USSD symptom codes for feature phone users',
};

export default function SymptomCodebookPage() {
  return <SymptomCodebook />;
}
