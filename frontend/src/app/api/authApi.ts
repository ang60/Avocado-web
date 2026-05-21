import type { AuthUser } from '../auth';
import { setAuthSession } from '../auth';
import { apiGet, apiPost } from './client';
import { API_PATHS } from './endpoints';

const publicCall = { auth: false as const };

/** Submit an access request (registration). Does not send any SMS; OTP is only for verifying an approved account at sign-in. */
export type AccessRequestResponse = {
  id: string;
  phone_number: string;
  email: string;
  first_name: string;
  last_name: string;
  role: any;
  county: string;
  entity: any;
  last_login?: string;
  is_staff?: boolean;
  is_active?: boolean;
};

export async function submitAccessRequest(params: {
  phone_number: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  county: string;
  password: string;
  password_confirm: string;
}): Promise<AccessRequestResponse> {
  return apiPost<AccessRequestResponse>(API_PATHS.users.register, params, publicCall);
}

/** Roles fetched for selection on registration page. */
export type RoleOption = {
  id: string;
  role_name: string;
  description: string;
  permissions: Array<{ id: string; name: string }>;
  users: number;
  permissions_count: number;
};

/** Roles for the public registration page (unauthenticated; server must allow `for_registration=1`). */
export async function fetchRoles(): Promise<RoleOption[]> {
  const res = await apiGet<{ results: RoleOption[] }>(
    `${API_PATHS.roles}?page_size=100&for_registration=1`,
    publicCall
  );
  return res.results;
}

/** Verify a farmer link using an OTP. */
export async function verifyLink(farmer_id: string, otp_code: string): Promise<{ status: string }> {
  return apiPost<{ status: string }>(API_PATHS.users.verifyLink, { farmer_id, otp_code }, publicCall);
}

/** Request a password reset. */
export async function requestPasswordReset(params: { identifier: string }): Promise<{ detail: string; code?: string }> {
  return apiPost(API_PATHS.users.requestPasswordReset, params, publicCall);
}

/** Confirm a password reset using the code sent to the phone. */
export async function confirmPasswordReset(params: {
  identifier: string;
  code: string;
  new_password: string;
}): Promise<{ detail: string }> {
  return apiPost(API_PATHS.users.confirmPasswordReset, params, publicCall);
}

/** SMS one-time code for an already-approved account — account verification at sign-in, not part of registration. */
export async function requestOtp(phoneNumber: string): Promise<void> {
  await apiPost(API_PATHS.users.requestOtp, { phone_number: phoneNumber }, publicCall);
}

export type VerifyOtpResponse = {
  refresh: string;
  access: string;
  user: AuthUser;
  is_new_user: boolean;
};

/** Complete sign-in after the user enters the verification code sent to their phone. */
export async function verifyOtp(phoneNumber: string, code: string): Promise<VerifyOtpResponse> {
  const res = await apiPost<VerifyOtpResponse>(
    API_PATHS.users.verifyOtp,
    { phone_number: phoneNumber, code },
    publicCall
  );
  setAuthSession({ access: res.access, refresh: res.refresh, user: res.user });
  return res;
}

/** Sign in with phone plus password (account must be approved). */
export async function loginWithPassword(phoneNumber: string, password: string): Promise<VerifyOtpResponse> {
  const res = await apiPost<VerifyOtpResponse>(
    API_PATHS.users.login,
    { phone_number: phoneNumber.trim(), password },
    publicCall
  );
  setAuthSession({ access: res.access, refresh: res.refresh, user: res.user });
  return res;
}
