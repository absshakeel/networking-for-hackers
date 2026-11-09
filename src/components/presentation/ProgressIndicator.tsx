import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store';

export function ProgressIndicator() {
  const { t } = useTranslation();
  const { getProgress, getCompletedCount, getTotalChapters } = useAppStore();
  
  const progress = getProgress();
  const completed = getCompletedCount();
  const total = getTotalChapters();
  
  return (
    <div className="flex items-center gap-4">
      <div className="hidden sm:flex items-center gap-2">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{t('progress')}</span>
        <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={t('progress')}
          />
        </div>
        <span className="text-sm font-mono tabular-nums text-slate-600 min-w-[3.5rem] text-right">
          {Math.round(progress)}%
        </span>
      </div>
      
      <div className="flex items-center gap-1.5 text-sm text-slate-500">
        <span className="font-mono tabular-nums text-slate-900 font-medium">{completed}</span>
        <span className="text-slate-300">/</span>
        <span className="font-mono tabular-nums text-slate-600">{total}</span>
        <span className="hidden md:inline">{t('chapter')}{total > 1 ? 's' : ''}</span>
      </div>
    </div>
  );
}