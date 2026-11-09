import { useTranslation } from 'react-i18next';

export function ChapterLoading() {
  const { t } = useTranslation();
  
  return (
    <div className="diagram-area flex items-center justify-center p-8" role="status" aria-live="polite">
      <div className="text-center max-w-md">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <svg className="w-full h-full text-primary-200" viewBox="0 0 48 48" aria-hidden="true">
            <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="4" className="opacity-30" />
            <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="90 150" strokeLinecap="round" className="animate-spin text-primary-600" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-1">{t('loading')}</h3>
        <p className="text-slate-500 text-sm">Preparing animated diagram...</p>
      </div>
    </div>
  );
}