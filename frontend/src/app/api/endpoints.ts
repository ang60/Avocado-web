/**
 * Django API base URL and paths (same host as Android `Constants.BASE_URL`).
 * Override with `VITE_API_BASE_URL` in `.env.local` / `.env.production`.
 */
/** Hosted API (Swagger: https://avo-guard.vercel.app/api/schema/swagger-ui/) */
export const DEFAULT_API_BASE_URL = 'https://avo-guard.vercel.app';

export const API_PATHS = {
  users: {
    requestOtp: '/api/users/request_otp/',
    verifyOtp: '/api/users/verify_otp/',
    register: '/api/users/register/',
    login: '/api/users/login/',
    loginPassword: '/api/users/login_password/',
    verifyLink: '/api/users/verify_link/',
    requestPasswordReset: '/api/users/request_password_reset/',
    confirmPasswordReset: '/api/users/confirm_password_reset/',
    uploadProfilePicture: '/api/users/upload_profile_picture/',
  },
  roles: '/api/roles/',
  pestScouting: {
    farms: '/api/pest-scouting/farms/',
    farmBlocks: '/api/pest-scouting/farm-blocks/',
    weeklyRecords: '/api/pest-scouting/weekly-records/',
    scoutingReports: '/api/pest-scouting/scouting-reports/',
    problemReports: '/api/pest-scouting/problem-reports/',
  },
  advisory: '/api/advisory-services/advisories/',
  alerts: '/api/alerts/alerts/',
  dashboard: '/api/dashboard/',
  /** Swagger: dashboard `api` app — FarmerProfile registry (agronomist view). */
  farmers: '/api/farmers/',
  /** Swagger: `hcda_registry` — FarmerRegistration list (used by HCDA + Farmers page). */
  hcdaFarmers: '/api/hcda-registry/farmers/',
  hcdaFarmersStatistics: '/api/hcda-registry/farmers/statistics/',
  hcdaCountyOverview: '/api/hcda-registry/county-overview/',
  caseManagement: '/api/case-management/cases/',
} as const;
