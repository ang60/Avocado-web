/**
 * Django API base URL and paths (same host as Android `Constants.BASE_URL`).
 * Override base with `VITE_API_BASE_URL` in `.env.local` for local `runserver`.
 */
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
  farmers: '/api/farmers/',
  caseManagement: '/api/case-management/cases/',
} as const;
