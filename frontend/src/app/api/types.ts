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
  managementProtocol?: string | null;
  reviewNotes?: string | null;
  pushedToFarmer?: boolean;
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
  variety?: string | null;
  reportLocation?: string | null;
  blockTreeCount?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  additionalNotes?: string | null;
  remarks?: string | null;
  gpsLatitude?: string | null;
  gpsLongitude?: string | null;
  mediaGallery?: string[];
  recordTypeOfTrap?: string;
  recordNumberOfTrap?: number;
  recordTrapsReplaced?: number;
  recordPestsPerTrap?: string | null;
}

export interface DashboardMetricCard {
  label: string;
  value: string | number;
  sublabel?: string;
  trendUp?: boolean;
  trendPercent?: number;
  trendVs?: string;
  icon: 'activity' | 'alert' | 'check' | 'clock' | 'target';
  iconBg: string;
  iconColor: string;
}

export interface TriageQueueItem {
  id: string;
  caseCode?: string;
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
  recordCode?: string;
  weeklyRecordId?: string | null;
  scout: string;
  farm: string;
  location: string;
  date: string;
  time: string;
  blocksInspected: number;
  issuesFound: number;
  status: string;
  /** `registry` = api.ScoutingReport; `mobile_app` = pest_scouting weekly record from smartphone */
  source?: 'registry' | 'mobile_app';
  trapSummary?: string;
  findingSummary?: string;
  blockName?: string;
  /** Mobile weekly raw: variety */
  variety?: string;
  /** Short comma-separated pest names (with counts when provided by app) */
  pestSummary?: string;
  diseaseSummary?: string;
  /** Mobile composite block label (e.g. county + block + trees) */
  mobileBlockLine?: string;
  /** Weekly JSON `farm_name` as typed in the app */
  farmNameAsSubmitted?: string;
  /** Weekly JSON `location` (ward / free text) */
  submissionLocation?: string;
  beneficialSummary?: string;
  diseaseMetaSummary?: string;
  gpsSummary?: string;
}

export interface RecentTrapActivityRow {
  id: string;
  trapName: string;
  numberOfTraps: number;
  farm: string;
  location: string;
  county: string;
  date: string;
  time: string;
}

export interface WeeklyTrendPoint {
  week: string;
  cases: number;
  resolved: number;
  /** Weekly mobile records + non–app-mirror scouting reports in that 7-day window */
  fieldReports?: number;
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
  /** Trap check-ins from the mobile app (`pest_scouting.TrapLog`). */
  recentTrapActivity?: RecentTrapActivityRow[];
  complianceSummary: { target: number; current: number };
  todayLabel: string;
  /** ISO date (YYYY-MM-DD) for matching `RecentScoutingRecord.date` to “today”. */
  todayDateKey?: string;
}

export type ProductionSourceType = 'regulator' | 'exporter' | 'cooperative';
export type ProductionSubmissionStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

export interface ProductionVolumeSubmission {
  id: string;
  year: number;
  month: number;
  county: string;
  sub_county: string;
  ward: string;
  village: string;
  tonnage_mt: number;
  source_type: ProductionSourceType;
  source_entity?: string | null;
  sourceEntityName?: string | null;
  status: ProductionSubmissionStatus;
  notes?: string;
  submittedBy?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ProductionResolvedRow {
  key: string[]; // [county] or [county, ward] or [county, ward, village]
  year: number;
  month: number;
  resolved_tonnage_mt: number;
  resolved_from: ProductionSourceType;
  status: ProductionSubmissionStatus;
  inputs: ProductionVolumeSubmission[];
}

export interface BroadcastCampaign {
  id: string;
  county: string;
  ward: string;
  village: string;
  message: string;
  status: string;
  total_recipients: number;
  sent_count: number;
  failed_count: number;
  createdBy?: string | null;
  created_at?: string;
  recipientsPreview?: Array<{ id: string; phone_number: string; status: string; error?: string }>;
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
  /** Prefer this over `owner` when present — synced from mobile `pest_scouting.Farm` */
  farmName?: string;
  owner: string;
  location: string;
  county: string;
  ward: string;
  primaryChannel: 'smartphone' | 'ussd';
  weeklyScoutingLogs: [number, number, number, number];
  lastScoutingResult: {
    status: 'high-risk' | 'medium-risk' | 'low-risk' | 'no-pests';
    finding: string;
    /** ISO-ish datetime from API when present */
    date?: string;
    scoutName?: string;
  };
  exportEligibility: 'ready' | 'at-risk' | 'suspended';
  totalAcres: number;
  phone: string;
  lastInspection: string;
  overdueScouts: boolean;
  /** Placeholder: linked exporter id from `data/exporters.ts` */
  linkedExporter?: string;
  complianceStatus?: 'compliant' | 'needs-follow-up';
  /**
   * Latest farm row from the mobile app (`pest_scouting.Farm`) — name, location,
   * blocks and size captured during onboarding / farm setup on device.
   */
  mobileFarmFromApp?: {
    farmName: string;
    location: string;
    numberOfBlocks: number | null;
    farmSize: number | null;
    updatedAt: string;
  } | null;
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
  /** From mobile onboarding (`pest_scouting.Farm`) when present */
  mobileFarmFromApp?: FarmerListRow['mobileFarmFromApp'];
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
  farmerCode?: string;
  /** Registry / generated farmer code shown as HCDA-style registration when present */
  hcdaRegNo?: string;
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
  complianceStatus?: string;
  activeCases: { id: string; issue: string; severity: string; status: string; date: string }[];
  recentActivities: { type: string; description: string; date: string; user: string }[];
  blocks: {
    id: string;
    name: string;
    acres: number;
    trees: number;
    status: string;
    lastInspection: string;
    source?: 'app' | 'registry';
  }[];
  trapLogsFromApp?: {
    trapName: string;
    numberOfTraps: number;
    photo: string;
    timestamp: string;
  }[];
  problemReportsFromApp?: {
    problemType: string;
    urgency: string;
    description: string;
    photo: string;
    timestamp: string;
  }[];
  /** Latest mobile Farm row (sanitized counts / sizes); omit when no app farm synced */
  mobileFarmFromApp?: {
    farmName: string;
    location: string;
    numberOfBlocks: number | null;
    farmSize: number | null;
    updatedAt: string;
  } | null;
  /** Latest weekly scouting payload from the mobile app (if any) */
  latestScoutingFromApp?: {
    id: string;
    timestamp: string;
    farmName: string;
    location: string;
    blockName: string;
    blockTrees: number;
    variety: string;
    trapUse: {
      type_of_trap?: string;
      number_of_trap?: number;
      average_no_of_pest_per_trap?: number;
      typeOfTrap?: string;
      numberOfTrap?: number;
      averageNoOfPestPerTrap?: number;
    }[];
    anyPestsObserved: string;
    pestsObserved: string[];
    beneficialInsectsObserved: string[];
    anyDiseasesObserved: string;
    diseasesObserved: string[];
    diseasePlantPart: string[];
    diseaseCropStage: string;
    diseaseDetectionMethod: string;
    actionsTaken: string[];
    outcome: string;
    otherProductionChallenges: string[];
    additionalNotes: string;
    gpsLatitude: string;
    gpsLongitude: string;
    mediaUrls: string[];
  } | null;
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
