import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { clearAuthSession } from '../auth';
import { PageLoader } from '../components/PageLoader';

/** Clears JWT session and sends the user to sign-in. */
export function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    clearAuthSession();
    navigate('/login', { replace: true });
  }, [navigate]);

  return <PageLoader />;
}
