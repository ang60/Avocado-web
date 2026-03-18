/** Fixed toast for success / info messages (no external deps). */
export function AppToast({
  message,
  variant = 'success',
  onDismiss,
}: {
  message: string;
  variant?: 'success' | 'info';
  onDismiss: () => void;
}) {
  const bg = variant === 'success' ? '#1B4332' : '#1E40AF';
  return (
    <div
      className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg max-w-md"
      style={{
        backgroundColor: bg,
        color: '#F7F4EF',
        fontFamily: 'IBM Plex Sans, sans-serif',
        fontSize: '14px',
      }}
      role="status"
    >
      <span className="flex-1">{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="text-sm opacity-80 hover:opacity-100 underline"
        aria-label="Dismiss"
      >
        Dismiss
      </button>
    </div>
  );
}
