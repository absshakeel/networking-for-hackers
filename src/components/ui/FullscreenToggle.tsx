interface FullscreenToggleProps {
  onClick: () => void;
  isFullscreen: boolean;
}

export function FullscreenToggle({ onClick, isFullscreen }: FullscreenToggleProps) {
  
  return (
    <button
      onClick={onClick}
      className="btn-icon p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100"
      aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
      aria-pressed={isFullscreen}
    >
      {isFullscreen ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
      )}
    </button>
  );
}