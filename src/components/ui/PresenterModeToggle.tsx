import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store';

export function PresenterModeToggle() {
  const { t } = useTranslation();
  const { presenterMode, togglePresenterMode } = useAppStore();
  
  return (
    <button
      onClick={togglePresenterMode}
      className={`btn-icon p-2 rounded-xl transition-colors ${
        presenterMode
          ? 'bg-primary-100 border border-primary-300 text-primary-700'
          : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
      }`}
      aria-label={t('presenterMode')}
      aria-pressed={presenterMode}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    </button>
  );
}