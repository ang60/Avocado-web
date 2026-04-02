import { Link } from 'react-router';
import { ShieldAlert } from 'lucide-react';
import avocadoLogo from '../../imports/avocado_logo.svg';

export function NoAccess() {
  return (
    <div
      className="flex min-h-[60vh] flex-col items-center justify-center px-4"
      style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
    >
      <img src={avocadoLogo} alt="" className="mb-4 h-12 w-12 opacity-90" />
      <ShieldAlert className="mb-2 h-10 w-10 text-amber-600" aria-hidden />
      <h1 className="text-xl font-semibold text-[#1B4332]">No access to that area</h1>
      <p className="mt-2 max-w-md text-center text-sm text-gray-600">
        Your role does not include permission to open this page. If you need access, ask an administrator to update your role
        permissions.
      </p>
      <Link
        to="/dashboard"
        className="mt-6 rounded-lg bg-[#2D6A4F] px-4 py-2 text-sm font-medium text-white hover:opacity-95"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
