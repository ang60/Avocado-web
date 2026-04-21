/** Shared types for placeholder API (swap for real backend types later). */

export type SubmissionSource = 'app' | 'ussd';
export type SeverityLevel = 'high' | 'medium' | 'low';
export type ReviewStatus = 'new' | 'under-review' | 'reviewed';

export interface ScoutingFeedItem {
  id: string;
  /** Farmer profile UUID from API — required to create a case from this row. */
  farmerId?: string;
  /** Farm block UUID when the submission is tied to a block. */
  blockUuid?: string | null;
  farmName: string;
  blockId: string;
  farmerName: string;
  severity: SeverityLevel;
  source: SubmissionSource;
  finding: string;
  status: 'clean' | 'detected';
  mediaPreview?: string;
  ussdCode?: string;
  timestamp: string;
  reviewed: ReviewStatus;
  county: string;
  assignedTo?: string;
  triageStatus?: 'pending' | 'confirmed' | 'needs_follow_up';
  triageLabel?: string | null;
  triagedAt?: string | null;
  auditFlags?: string[];
  rawTimestamp?: string;
  pestsObservedList?: string[];
  diseasesObservedList?: string[];
  beneficialInsectsObservedList?: string[];
  pestPlantPartsAffectedList?: string[];
  diseasePlantPartsAffectedList?: string[];
  actionsTakenList?: string[];
  outcomeList?: string[];
  rawPayload?: Record<string, unknown>;
}

export interface DashboardMetricCard {
  label: string;
  value: string | number;
  sublabel?: string;
  trendUp?: boolean;
  trendPercent?: number;
  trendVs?: string;
  icon: 'activity' | 'alert' | 'check' | 'clock';
  iconBg: string;
  iconColor: string;
}

export interface TriageQueueItem {
  id: string;
  farm: string;
  location: string;
  severity: 'high' | 'medium' | 'low';
  pest: string;
  scout: string;
  submittedHours: number;
  priority: number;
}

export interface RecentScoutingRecord {
  id: string;
  scout: string;
  farm: string;
  location: string;
  date: string;
  time: string;
  blocksInspected: number;
  issuesFound: number;
  status: string;
}

export interface WeeklyTrendPoint {
  week: string;
  cases: number;
  resolved: number;
}

export interface WeeklyCompliancePoint {
  week: string;
  compliance: number;
  target: number;
}

export interface PestSlice {
  name: string;
  value: number;
  color: string;
}

export interface DashboardPayload {
  metrics: DashboardMetricCard[];
  weeklyComplianceData: WeeklyCompliancePoint[];
  weeklyTrends: WeeklyTrendPoint[];
  pestDistribution: PestSlice[];
  triageQueue: TriageQueueItem[];
  recentScoutingRecords: RecentScoutingRecord[];
  complianceSummary: { target: number; current: number };
  todayLabel: string;
}

export interface NavbarUser {
  name: string;
  initials: string;
  role: string;
}

export interface NavbarNotification {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  unread: boolean;
}

export interface SearchResultItem {
  id: string;
  label: string;
  sublabel: string;
  path: string;
  type: 'case' | 'farm' | 'scout' | 'submission' | 'page';
}

/** Case Management — KPI row */
export interface CaseManagementKpi {
  title: string;
  value: string;
  icon: 'users' | 'folder' | 'alert' | 'check';
  iconColor: string;
  iconBg: string;
}

/** Case Management — table row (matches CaseTableEnhanced) */
export interface CaseManagementCaseRow {
  id: string;
  caseCode?: string;
  severity: 'high' | 'medium' | 'low' | 'unknown';
  farm: string;
  block: string;
  pestDisease: string;
  pestDiseaseKiswahili: string;
  dateSubmitted: string;
  status: 'new' | 'under_review' | 'verified' | 'closed';
  scoutName: string;
  location: string;
  affectedTrees: number;
  symptoms: string[];
  notes: string;
  channel: 'smartphone' | 'ussd' | 'sms';
}

export interface CaseManagementPayload {
  kpis: CaseManagementKpi[];
  cases: CaseManagementCaseRow[];
}

export interface OutbreakTrendPoint {
  date: string;
  thrips: number;
  rootRot: number;
  mites: number;
  anthracnose: number;
}

export interface ActiveOutbreakEvent {
  id: string;
  pest: string;
  severity: 'critical' | 'high' | 'medium';
  location: string;
  farmsAffected: number;
  casesLinked: number;
  firstDetected: string;
  trend: 'increasing' | 'stable' | 'decreasing';
}

export interface CountyHeatEntry {
  county: string;
  intensity: number;
  cases: number;
  color: string;
}

export interface OutbreakMonitoringPayload {
  alertTitle: string;
  alertMessage: string;
  stats: {
    activeOutbreaks: number;
    critical: number;
    regionsAffected: number;
    avgResponseTime: string;
  };
  outbreakTrends: OutbreakTrendPoint[];
  countyHeatMap: CountyHeatEntry[];
  activeOutbreaks: ActiveOutbreakEvent[];
}

/** Alerts page */
export interface PlaceholderAlert {
  id: string;
  type: string;
  severity: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  category: string;
  affectedFarmers?: { id: string; name: string; initials: string }[];
  geoCluster?: { county: string; radius: string; centerPoint: string; affectedFarms: number };
  primaryAction: { label: string; route: string | null; icon?: string };
  secondaryAction: { label: string; route: string | null };
}

export interface SymptomCodebookEntry {
  code: string;
  promptKiswahili: string;
  promptEnglish: string;
  physicalSymptom: string;
  linkedArticle: string;
  articleTitle: string;
  severity: string;
  menuPath: string;
}

export interface FarmerListRow {
  id: string;
  farmerCode?: string;
  name: string;
  owner: string;
  location: string;
  county: string;
  ward: string;
  primaryChannel: 'smartphone' | 'ussd';
  weeklyScoutingLogs: [number, number, number, number];
  lastScoutingResult: {
    status: 'high-risk' | 'medium-risk' | 'low-risk' | 'no-pests';
    finding: string;
  };
  exportEligibility: 'ready' | 'at-risk' | 'suspended';
  totalAcres: number;
  phone: string;
  lastInspection: string;
  overdueScouts: boolean;
  /** Placeholder: linked exporter id from `data/exporters.ts` */
  linkedExporter?: string;
  complianceStatus?: 'compliant' | 'needs-follow-up';
}

export interface ComplianceFarmerRow {
  id: string;
  farmerCode?: string;
  name: string;
  farmName: string;
  location: string;
  county: string;
  scoutingHistory: [boolean, boolean, boolean, boolean];
  riskLevel: 'high' | 'medium' | 'low';
  submissionMode: 'app' | 'ussd';
  reportStatus: 'incomplete' | 'pending-approval' | 'export-ready';
  lastUpdate: string;
  phoneNumber: string;
}

export interface KnowledgeArticleSummary {
  id: string;
  title: string;
  category: string;
  tags: string[];
  summary: string;
  lastUpdated: string;
  views: number;
  severity: string;
  activeUses: number;
  approvedContent: boolean;
  ussdCode: string | null;
  chemicalGate: string;
  ipmLevel: number;
}

export interface KnowledgeCategoryRow {
  name: string;
  count: number;
}

export interface AdminSystemStat {
  label: string;
  value: string;
  icon: 'users' | 'activity' | 'database' | 'settings';
  color: string;
}

export interface AdminUserRow {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  county: string;
  status: string;
  lastLogin: string;
}

export interface AdminRoleRow {
  id: string;
  name: string;
  description: string;
  users: number;
  permissions: number;
}

export interface AdminAlertRuleRow {
  id: string;
  name: string;
  condition: string;
  threshold: string;
  county: string;
  pest: string;
  action: string;
  status: string;
  triggered: number;
  lastTriggered: string;
}

export interface AdminPayload {
  systemStats: AdminSystemStat[];
  users: AdminUserRow[];
  roles: AdminRoleRow[];
  alertRules: AdminAlertRuleRow[];
}

/** Admin: entity (exporter/government/partner organization) rows */
export interface AdminEntityRow {
  id: string;
  companyName: string;
  hcdaLicense: string;
  licenseExpiry: string;
  headAgronomist: string;
  linkedFarmers: number;
  status: boolean;
  email: string;
  phone: string;
  county: string;
  /** UI-friendly entity type slug (exporter/kephis/hcda/partner) */
  entityType: string;
}

/** Farmer detail — extends list row with rich profile */
export interface FarmerDetailPayload {
  id: string;
  name: string;
  farmName: string;
  location: string;
  county: string;
  ward: string;
  subCounty: string;
  phone: string;
  email: string;
  primaryChannel: 'smartphone' | 'ussd';
  registrationDate: string;
  totalAcres: number;
  blocksManaged: number;
  treesCount: number;
  exportEligibility: 'ready' | 'at-risk' | 'suspended';
  lastScoutingResult: {
    status: string;
    finding: string;
    date: string;
    scoutName: string;
  };
  weeklyScoutingLogs: { week: string; completed: boolean; date: string; scout: string }[];
  complianceScore: number;
  activeCases: { id: string; issue: string; severity: string; status: string; date: string }[];
  recentActivities: { type: string; description: string; date: string; user: string }[];
  blocks: { id: string; name: string; acres: number; trees: number; status: string; lastInspection: string }[];
}

export interface KnowledgeBaseListPayload {
  articles: KnowledgeArticleSummary[];
  categories: KnowledgeCategoryRow[];
}

/** Case detail page (rich case view) */
export interface CaseDetailPayload {
  id: string;
  caseCode?: string;
  caseStatus?: string;
  farmerName: string;
  farmerPhone: string;
  location: string;
  subCounty: string;
  farm: string;
  block: string;
  blockCoordinates: { lat: number; lng: number };
  severity: string;
  submissionChannel: string;
  pestDisease: string;
  pestDiseaseKiswahili: string;
  dateSubmitted: string;
  scoutName: string;
  scoutPhone: string;
  affectedTrees: number;
  symptoms: string[];
  symptomCodes: string[];
  notes: string;
  photos: { id: number; url: string; caption: string }[];
  voiceNote: { duration: string; url: string };
  timeline: { stage: string; timestamp: string | null; status: string }[];
}
