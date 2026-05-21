import { Link, type LinkProps } from 'react-router';

/**
 * SPA navigation (React Router). Same role as Next.js `<Link>` — avoids full page reloads.
 * `prefetch="intent"` loads route modules on hover/focus so transitions feel instant.
 */
export function AppLink({ prefetch = 'intent', ...props }: LinkProps) {
  return <Link prefetch={prefetch} {...props} />;
}
