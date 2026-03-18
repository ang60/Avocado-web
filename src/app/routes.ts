import { createBrowserRouter } from "react-router";
import { Dashboard } from "./pages/Dashboard";
import { ScoutingReports } from "./pages/ScoutingReports";
import { CaseManagement } from "./pages/CaseManagement";
import { CaseDetail } from "./pages/CaseDetail";
import { OutbreakMonitoring } from "./pages/OutbreakMonitoring";
import { Alerts } from "./pages/Alerts";
import { KnowledgeBase } from "./pages/KnowledgeBase";
import { KBArticleDetail } from "./pages/KBArticleDetail";
import { SymptomCodebook } from "./pages/SymptomCodebook";
import { Farmers } from "./pages/Farmers";
import { FarmerDetail } from "./pages/FarmerDetail";
import { ComplianceHub } from "./pages/ComplianceHub";
import { Admin } from "./pages/Admin";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Dashboard,
  },
  {
    path: "/scouting-reports",
    Component: ScoutingReports,
  },
  {
    path: "/case-management",
    Component: CaseManagement,
  },
  {
    path: "/case-management/:caseId",
    Component: CaseDetail,
  },
  {
    path: "/outbreak-monitoring",
    Component: OutbreakMonitoring,
  },
  {
    path: "/alerts",
    Component: Alerts,
  },
  {
    path: "/knowledge-base",
    Component: KnowledgeBase,
  },
  {
    path: "/knowledge-base/:articleId",
    Component: KBArticleDetail,
  },
  {
    path: "/symptom-codebook",
    Component: SymptomCodebook,
  },
  {
    path: "/farmers",
    Component: Farmers,
  },
  {
    path: "/farmers/:farmerId",
    Component: FarmerDetail,
  },
  {
    path: "/compliance-hub",
    Component: ComplianceHub,
  },
  {
    path: "/admin",
    Component: Admin,
  },
]);