import type { AuthUser } from '../auth';
import { setAuthSession } from '../auth';
import { apiRequest } from './client';

/** Submit an access request (registration). Does not send any SMS; OTP is only for verifying an approved account at sign-in. */
export type AccessRequestResponse = {
  detail: string;
  status: string;
};

export async function submitAccessRequest(params: {
  name: string;
  email?: string;
  phone_number: string;
  password: string;
  password_confirm: string;
}): Promise<AccessRequestResponse> {
  return apiRequest<AccessRequestResponse>('/api/users/register/', {
    method: 'POST',
    auth: false,
    body: JSON.stringify(params),
  });
}

/** SMS one-time code for an already-approved account — account verification at sign-in, not part of registration. */
export async function requestOtp(phoneNumber: string): Promise<void> {
  await apiRequest('/api/users/request_otp/', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ phone_number: phoneNumber }),
  });
}

export type VerifyOtpResponse = {
  refresh: string;
  access: string;
  user: AuthUser;
  is_new_user: boolean;
};

/** Complete sign-in after the user enters the verification code sent to their phone. */
export async function verifyOtp(phoneNumber: string, code: string): Promise<VerifyOtpResponse> {
  const res = await apiRequest<VerifyOtpResponse>('/api/users/verify_otp/', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ phone_number: phoneNumber, code }),
  });
  setAuthSession({ access: res.access, refresh: res.refresh, user: res.user });
  return res;
}

/** Sign in with email or phone plus password (account must be approved). */
export async function loginWithPassword(identifier: string, password: string): Promise<VerifyOtpResponse> {
  const res = await apiRequest<VerifyOtpResponse>('/api/users/login_password/', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ identifier: identifier.trim(), password }),
  });
  setAuthSession({ access: res.access, refresh: res.refresh, user: res.user });
  return res;
}

