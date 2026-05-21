/** Shown while lazy-loaded routes resolve. */
export function PageLoader() {
  return (
    <div
      className="flex items-center justify-center min-h-[40vh]"
      style={{ fontFamily: 'IBM Plex Sans, sans-serif', color: '#717182' }}
    >
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: '#2D6A4F', borderTopColor: 'transparent' }}
        />
        <span className="text-sm">Loading…</span>
      </div>
    </div>
  );
}
