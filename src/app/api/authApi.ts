import type { AuthUser } from '../auth';
import { setAuthSession } from '../auth';
import { apiRequest } from './client';

export async function registerAndRequestOtp(params: { name: string; email: string; phone_number: string }): Promise<void> {
  await apiRequest('/api/users/register/', {
    method: 'POST',
    auth: false,
    body: JSON.stringify(params),
  });
}

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

export async function verifyOtp(phoneNumber: string, code: string): Promise<VerifyOtpResponse> {
  const res = await apiRequest<VerifyOtpResponse>('/api/users/verify_otp/', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ phone_number: phoneNumber, code }),
  });
  setAuthSession({ access: res.access, refresh: res.refresh, user: res.user });
  return res;
}

