import type { ReactNode } from 'react';

import page013 from '../../assets/pdf/avocado-pest-disease/page-013.png';
import page014 from '../../assets/pdf/avocado-pest-disease/page-014.png';
import page015 from '../../assets/pdf/avocado-pest-disease/page-015.png';
import page016 from '../../assets/pdf/avocado-pest-disease/page-016.png';
import page031 from '../../assets/pdf/avocado-pest-disease/page-031.png';
import page032 from '../../assets/pdf/avocado-pest-disease/page-032.png';
import page034 from '../../assets/pdf/avocado-pest-disease/page-034.png';
import page036 from '../../assets/pdf/avocado-pest-disease/page-036.png';
import page041 from '../../assets/pdf/avocado-pest-disease/page-041.png';
import page045 from '../../assets/pdf/avocado-pest-disease/page-045.png';
import page046 from '../../assets/pdf/avocado-pest-disease/page-046.png';
import page054 from '../../assets/pdf/avocado-pest-disease/page-054.png';
import page055 from '../../assets/pdf/avocado-pest-disease/page-055.png';
import page062 from '../../assets/pdf/avocado-pest-disease/page-062.png';
import page063 from '../../assets/pdf/avocado-pest-disease/page-063.png';
import page064 from '../../assets/pdf/avocado-pest-disease/page-064.png';
import page072 from '../../assets/pdf/avocado-pest-disease/page-072.png';
import page073 from '../../assets/pdf/avocado-pest-disease/page-073.png';
import page079 from '../../assets/pdf/avocado-pest-disease/page-079.png';
import page081 from '../../assets/pdf/avocado-pest-disease/page-081.png';
import page083 from '../../assets/pdf/avocado-pest-disease/page-083.png';
import page085 from '../../assets/pdf/avocado-pest-disease/page-085.png';
import page086 from '../../assets/pdf/avocado-pest-disease/page-086.png';
import page088 from '../../assets/pdf/avocado-pest-disease/page-088.png';
import page089 from '../../assets/pdf/avocado-pest-disease/page-089.png';
import page094 from '../../assets/pdf/avocado-pest-disease/page-094.png';
import page095 from '../../assets/pdf/avocado-pest-disease/page-095.png';
import page096 from '../../assets/pdf/avocado-pest-disease/page-096.png';
import page097 from '../../assets/pdf/avocado-pest-disease/page-097.png';
import page098 from '../../assets/pdf/avocado-pest-disease/page-098.png';
import page099 from '../../assets/pdf/avocado-pest-disease/page-099.png';

export type SeverityLevel = 'high' | 'medium' | 'low';
export type ChemicalGate = 'gated' | 'open';

export type KnowledgeBaseListItem = {
  id: string;
  title: string;
  category: string;
  tags: string[];
  summary: string;
  lastUpdated: string;
  views: number;
  severity: SeverityLevel;
  activeUses: number;
  approvedContent: boolean;
  ussdCode: string | null;
  chemicalGate: ChemicalGate;
  ipmLevel: 1 | 2 | 3;
  /** Optional cover image shown in detail view */
  coverImage?: string;
};

export type KnowledgeBaseMedia = {
  src: string;
  title: string;
  caption?: string;
  /** PDF slide/page number for traceability */
  pdfPage?: number;
};

export type KnowledgeBaseDetail = KnowledgeBaseListItem & {
  advisorySnippetEN: string;
  advisorySnippetSW: string;
  identificationSigns: string[];
  lifeCycle: string;
  economicImpact: string;
  fieldPhotos?: { title: string; description: string; stage: string }[];
  ipmLadder: any;
  /** Extracted slide images from the training PDF */
  media?: KnowledgeBaseMedia[];
  source?: {
    pdf: string;
    presenter?: string;
    venue?: string;
  };
};

export const knowledgeBaseCategories = [
  { name: 'All Articles', count: 0 },
  { name: 'Pest Management', count: 0 },
  { name: 'Disease Management', count: 0 },
  { name: 'Best Practices', count: 0 },
  { name: 'Field Operations', count: 0 },
  { name: 'Pest Biology', count: 0 },
] as const;

/**
 * List items shown on `/knowledge-base`.
 * Note: counts are computed in UI (so we keep this list the source of truth).
 */
export const knowledgeBaseArticles: KnowledgeBaseListItem[] = [
  {
    id: 'KB-045',
    title: 'Avocado Thrips: Identification and Management',
    category: 'Pest Management',
    tags: ['Thrips', 'IPM', 'Treatment'],
    summary:
      'Comprehensive guide to identifying and managing avocado thrips infestations, including life cycle, damage symptoms, and control strategies.',
    lastUpdated: 'Mar 10, 2026',
    views: 1247,
    severity: 'high',
    activeUses: 14,
    approvedContent: true,
    ussdCode: '102',
    chemicalGate: 'gated',
    ipmLevel: 3,
    coverImage: page055,
  },
  {
    id: 'KB-044',
    title: 'Phytophthora Root Rot Prevention and Control',
    category: 'Disease Management',
    tags: ['Root Rot', 'Prevention', 'Drainage'],
    summary:
      'Best practices for preventing and controlling Phytophthora root rot, including soil management, irrigation practices, and treatment options.',
    lastUpdated: 'Mar 8, 2026',
    views: 982,
    severity: 'high',
    activeUses: 22,
    approvedContent: true,
    ussdCode: '205',
    chemicalGate: 'gated',
    ipmLevel: 3,
    coverImage: page062,
  },
  {
    id: 'KB-PDF-001',
    title: 'Persea Mites (Oligonychus perseae): Identification, Scouting, and IPM',
    category: 'Pest Management',
    tags: ['Persea mite', 'IPM', 'Scouting', 'Hass', 'KEPHIS'],
    summary:
      'Persea mites infest the underside of leaves causing spotting and defoliation. Early scouting and IPM (cultural, biological, and targeted products) reduce yield loss and sunburn risk.',
    lastUpdated: 'Mar 18, 2026',
    views: 0,
    severity: 'high',
    activeUses: 0,
    approvedContent: true,
    ussdCode: null,
    chemicalGate: 'gated',
    ipmLevel: 3,
    coverImage: page014,
  },
  {
    id: 'KB-PDF-002',
    title: 'Fruit Flies in Avocado: Monitoring, Sanitation, and Trapping',
    category: 'Pest Management',
    tags: ['Fruit flies', 'Trapping', 'Sanitation', 'Export'],
    summary:
      'Monitor from fruit set using traps and symptom checks. Sanitation twice weekly and proper disposal of fallen fruits prevents population build-up; trapping supports early detection and mass capture.',
    lastUpdated: 'Mar 18, 2026',
    views: 0,
    severity: 'high',
    activeUses: 0,
    approvedContent: true,
    ussdCode: null,
    chemicalGate: 'open',
    ipmLevel: 2,
    coverImage: page031,
  },
  {
    id: 'KB-PDF-003',
    title: 'False Codling Moth (FCM): Identification and Pheromone Trap Management',
    category: 'Pest Management',
    tags: ['FCM', 'Pheromone traps', 'Sanitation'],
    summary:
      'Larvae tunnel into fruit and leave frass at entry points. Management relies on sanitation, scouting, and pheromone traps for monitoring and mass trapping.',
    lastUpdated: 'Mar 18, 2026',
    views: 0,
    severity: 'high',
    activeUses: 0,
    approvedContent: true,
    ussdCode: null,
    chemicalGate: 'open',
    ipmLevel: 2,
    coverImage: page036,
  },
  {
    id: 'KB-PDF-004',
    title: 'Scale Insects: Monitoring, Ant Control, and Targeted Treatments',
    category: 'Pest Management',
    tags: ['Scale insects', 'Ant control', 'Beneficials'],
    summary:
      'Inspect leaves/stems/fruits for bumps and honeydew/sooty mold. Reduce tree stress, prune canopies, manage ants, conserve beneficials, and treat at crawler stage if thresholds are exceeded.',
    lastUpdated: 'Mar 18, 2026',
    views: 0,
    severity: 'medium',
    activeUses: 0,
    approvedContent: true,
    ussdCode: null,
    chemicalGate: 'open',
    ipmLevel: 2,
    coverImage: page045,
  },
  {
    id: 'KB-PDF-005',
    title: 'Thrips: Symptoms, Monitoring, and Management',
    category: 'Pest Management',
    tags: ['Thrips', 'Sticky traps', 'Natural enemies'],
    summary:
      'Fruit scarring and browning/drying of tissues can reduce market value. Combine scouting and sticky traps with conservation of natural enemies and careful pesticide use.',
    lastUpdated: 'Mar 18, 2026',
    views: 0,
    severity: 'medium',
    activeUses: 0,
    approvedContent: true,
    ussdCode: null,
    chemicalGate: 'open',
    ipmLevel: 2,
    coverImage: page054,
  },
  {
    id: 'KB-PDF-007',
    title: 'Avocado Sunblotch Viroid (ASBVd): Identification and Biosecurity',
    category: 'Disease Management',
    tags: ['Sunblotch', 'Viroid', 'Propagation', 'Biosecurity'],
    summary:
      'Sunblotch may be symptomless for years and spreads via propagation materials, pollen, seed, and tools. Use certified viroid-free material, test mother blocks, and remove infected trees.',
    lastUpdated: 'Mar 18, 2026',
    views: 0,
    severity: 'high',
    activeUses: 0,
    approvedContent: true,
    ussdCode: null,
    chemicalGate: 'open',
    ipmLevel: 3,
    coverImage: page072,
  },
  {
    id: 'KB-PDF-008',
    title: 'Anthracnose: Post-harvest Fruit Disease Management',
    category: 'Disease Management',
    tags: ['Anthracnose', 'Copper fungicide', 'Post-harvest'],
    summary:
      'Dark spots and internal rots can worsen post-harvest. Sanitation, pruning, copper-based fungicides, balanced fertilization, and good drainage help reduce losses.',
    lastUpdated: 'Mar 18, 2026',
    views: 0,
    severity: 'high',
    activeUses: 0,
    approvedContent: true,
    ussdCode: null,
    chemicalGate: 'open',
    ipmLevel: 2,
    coverImage: page081,
  },
  {
    id: 'KB-PDF-009',
    title: 'Cercospora Fruit Spot: Symptoms and Control Timing',
    category: 'Disease Management',
    tags: ['Cercospora', 'Humidity', 'Copper fungicide'],
    summary:
      'Light-yellow spots become reddish-brown and may crack, inviting secondary decay. Disease is favored by humid, hot conditions and spreads by splash and wind.',
    lastUpdated: 'Mar 18, 2026',
    views: 0,
    severity: 'medium',
    activeUses: 0,
    approvedContent: true,
    ussdCode: null,
    chemicalGate: 'open',
    ipmLevel: 2,
    coverImage: page085,
  },
  {
    id: 'KB-PDF-010',
    title: 'Avocado Scab: Identification and Orchard Sanitation',
    category: 'Disease Management',
    tags: ['Scab', 'Copper fungicide', 'Sanitation'],
    summary:
      'Scab infects young tissues in humid areas; lesions can coalesce and create corky fruit surfaces. Sanitation and copper sprays at pre-flowering and fruit formation reduce infection.',
    lastUpdated: 'Mar 18, 2026',
    views: 0,
    severity: 'medium',
    activeUses: 0,
    approvedContent: true,
    ussdCode: null,
    chemicalGate: 'open',
    ipmLevel: 2,
    coverImage: page089,
  },
  {
    id: 'KB-PDF-011',
    title: 'Orchard Biosecurity: A Practical Checklist',
    category: 'Best Practices',
    tags: ['Biosecurity', 'Visitors', 'Tools', 'Vehicles'],
    summary:
      'Biosecurity practices prevent, minimize, and manage pest spread. Covers pest scouting/records, propagation material checks, people hygiene, and equipment/vehicle disinfection.',
    lastUpdated: 'Mar 18, 2026',
    views: 0,
    severity: 'low',
    activeUses: 0,
    approvedContent: true,
    ussdCode: null,
    chemicalGate: 'open',
    ipmLevel: 1,
    coverImage: page094,
  },
];

/** Slide images from the training PDF for use in KB detail view. */
export const pdfMediaByArticleId: Record<string, KnowledgeBaseMedia[]> = {
  'KB-PDF-001': [
    { src: page013, title: 'Persea mites damage overview', pdfPage: 13 },
    { src: page014, title: 'Signs and symptoms (leaf spotting)', pdfPage: 14 },
    { src: page015, title: 'Defoliation and sunburn risk', pdfPage: 15 },
    { src: page016, title: 'Stress and yield reduction', pdfPage: 16 },
  ],
  'KB-PDF-002': [
    { src: page031, title: 'Fruit fly monitoring checklist', pdfPage: 31 },
    { src: page032, title: 'Orchard sanitation guidance', pdfPage: 32 },
    { src: page034, title: 'Trapping and attractants', pdfPage: 34 },
  ],
  'KB-PDF-003': [
    { src: page036, title: 'FCM identification', pdfPage: 36 },
    { src: page041, title: 'Pheromone trap use and maintenance', pdfPage: 41 },
  ],
  'KB-PDF-004': [
    { src: page045, title: 'Scale insect management overview', pdfPage: 45 },
    { src: page046, title: 'Scale management details', pdfPage: 46 },
  ],
  'KB-PDF-005': [
    { src: page054, title: 'Thrips overview', pdfPage: 54 },
    { src: page055, title: 'Thrips symptoms', pdfPage: 55 },
  ],
  'KB-044': [
    { src: page062, title: 'Root rot overview', pdfPage: 62 },
    { src: page063, title: 'Canopy symptoms', pdfPage: 63 },
    { src: page064, title: 'Root symptoms', pdfPage: 64 },
  ],
  'KB-PDF-007': [
    { src: page072, title: 'Sunblotch general information', pdfPage: 72 },
    { src: page073, title: 'Sunblotch identification', pdfPage: 73 },
    { src: page079, title: 'Sunblotch transmission', pdfPage: 79 },
  ],
  'KB-PDF-008': [
    { src: page081, title: 'Anthracnose on fruit', pdfPage: 81 },
    { src: page083, title: 'Anthracnose symptoms and notes', pdfPage: 83 },
  ],
  'KB-PDF-009': [
    { src: page085, title: 'Cercospora fruit spot', pdfPage: 85 },
    { src: page086, title: 'Cercospora symptoms and control', pdfPage: 86 },
  ],
  'KB-PDF-010': [
    { src: page088, title: 'Scab overview', pdfPage: 88 },
    { src: page089, title: 'Scab symptoms', pdfPage: 89 },
  ],
  'KB-PDF-011': [
    { src: page094, title: 'Orchard biosecurity definition', pdfPage: 94 },
    { src: page095, title: 'Critical areas', pdfPage: 95 },
    { src: page096, title: 'Pest scouting and records', pdfPage: 96 },
    { src: page097, title: 'Product management', pdfPage: 97 },
    { src: page098, title: 'People biosecurity', pdfPage: 98 },
    { src: page099, title: 'Equipment and vehicles', pdfPage: 99 },
  ],
};

/**
 * Feature-phone USSD lookup list (existing mock), moved here so KB can reuse it.
 */
export const ussdSymptomCodesLookup = [
  { code: '101', symptom: 'Wilting Leaves', category: 'General Symptoms' },
  { code: '102', symptom: 'Yellowing Leaves', category: 'General Symptoms' },
  { code: '103', symptom: 'Leaf Spots/Lesions', category: 'General Symptoms' },
  { code: '104', symptom: 'Scarring on Fruit', category: 'Fruit Damage' },
  { code: '105', symptom: 'Holes in Fruit', category: 'Fruit Damage' },
  { code: '201', symptom: 'Root Discoloration', category: 'Root Issues' },
  { code: '202', symptom: 'Trunk Cankers', category: 'Trunk Issues' },
  { code: '203', symptom: 'Black Spots on Fruit', category: 'Fruit Damage' },
  { code: '204', symptom: 'Premature Fruit Drop', category: 'Fruit Damage' },
  { code: '205', symptom: 'Tree Decline', category: 'General Symptoms' },
] as const;

export function computeCategoryCounts(items: KnowledgeBaseListItem[]) {
  const counts = new Map<string, number>();
  for (const a of items) {
    counts.set(a.category, (counts.get(a.category) ?? 0) + 1);
  }
  return counts;
}

