import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store';
import { ModuleSelector } from '../navigation/ModuleSelector';

interface PresentationHeaderProps {
  moduleTitle: string;
  chapterTitle: string;
  chapterNumber: number;
  totalChapters: number;
  onFullscreenToggle: () => void;
  isFullscreen: boolean;
}

export function PresentationHeader({
  moduleTitle,
  chapterTitle,
  chapterNumber,
  totalChapters,
  onFullscreenToggle,
  isFullscreen,
}: PresentationHeaderProps) {
  const { t } = useTranslation();
  const { currentModule, modules, setCurrentModule } = useAppStore();
  
  return (
    <header className="flex-shrink-0 border-b border-slate-200 bg-white px-6 py-4">
      <div className="max-w-full mx-auto">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-semibold text-primary-600 uppercase tracking-wider">
                {t('module')} {currentModule}
              </span>
              <ModuleSelector 
                modules={modules}
                currentModule={currentModule}
                onChange={setCurrentModule}
              />
              <span className="text-xs text-slate-400 tabular-nums">
                {modules.find((m) => m.id === currentModule)?.chapters.length ?? 0} {t('chapters')}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              {moduleTitle}
            </h1>
            <p className="text-slate-500 text-sm mt-1">{chapterTitle}</p>
          </div>
          
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-xs font-mono text-slate-500">{t('chapter')}</span>
              <span className="text-lg font-bold tabular-nums text-slate-900">{chapterNumber}</span>
              <span className="text-xs font-mono text-slate-400">/</span>
              <span className="text-lg font-bold tabular-nums text-slate-900">{totalChapters}</span>
            </div>
            
            <button
              onClick={onFullscreenToggle}
              className="btn-icon p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              aria-label={isFullscreen ? t('exitFullscreen') : t('fullscreen')}
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
          </div>
        </div>
      </div>
    </header>
  );
}