export type StaticAlertRule = {
  id: string;
  title: string;
  severity: 'critical' | 'warning' | 'info';
  source: string;
  details: string[];
};

/**
 * Static rules derived from training / agronomy guidance.
 * These are displayed in the Alerts UI and can later be wired to real-time triggers.
 */
export const staticAlertRules: StaticAlertRule[] = [
  {
    id: 'RULE-PERSEA-THRESHOLD',
    title: 'Persea mite action threshold',
    severity: 'warning',
    source: 'Avocado Pest & Disease Management (KEPHIS training PDF)',
    details: [
      'Begin management when 7.5–10% of leaf surface is damaged, OR ~70–100 mites per leaf are estimated.',
      'Scout every 7–10 days; confirm using a hand lens and underside inspection.',
    ],
  },
  {
    id: 'RULE-FRUITFLY-SANITATION',
    title: 'Fruit fly sanitation cadence',
    severity: 'info',
    source: 'Avocado Pest & Disease Management (KEPHIS training PDF)',
    details: [
      'Remove fallen fruits twice per week for the entire season to avoid population build-up.',
      'Dispose by burning, solarizing in black bags, or burying ≥ 50 cm deep.',
    ],
  },
  {
    id: 'RULE-FCM-TRAPS',
    title: 'FCM pheromone trap guidance',
    severity: 'info',
    source: 'Avocado Pest & Disease Management (KEPHIS training PDF)',
    details: [
      'Monitoring: 1 trap per hectare; check weekly.',
      'Mass trapping: 5–10 traps per hectare; replace lures every 4–6 weeks.',
    ],
  },
];

