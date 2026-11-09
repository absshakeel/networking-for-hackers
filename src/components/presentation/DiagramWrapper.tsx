import { useTranslation } from 'react-i18next';
import { DiagramProps, Chapter } from '../../types';

interface DiagramWrapperProps {
  chapter: Chapter;
  animationState: DiagramProps['animationState'];
  reducedMotion: boolean;
  children: React.ReactNode;
}

export function DiagramWrapper({ 
  chapter, 
  animationState, 
  reducedMotion,
  children 
}: DiagramWrapperProps) {
  const { t } = useTranslation();
  
  return (
    <div className="diagram-area relative" role="region" aria-label={`${t('chapter')} ${chapter.id}: ${chapter.title}`}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full h-full relative">
          {children}
        </div>
      </div>
      
      {!reducedMotion && animationState.isPlaying && (
        <div className="absolute top-4 right-4 z-10 animate-pulse-soft" aria-live="polite">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-600/90 text-white text-sm font-medium shadow-lg">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" aria-hidden="true"></span>
            {t('playing')}
          </div>
        </div>
      )}
      
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto max-w-md">
          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-600 transition-all duration-300 ease-out"
              style={{ width: `${animationState.progress}%` }}
              role="progressbar"
              aria-valuenow={Math.round(animationState.progress)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={t('progress')}
            />
          </div>
        </div>
        
        <div className="pointer-events-auto flex items-center gap-2 text-xs text-slate-500 font-mono tabular-nums">
          <span>{formatTime(animationState.currentTime)}</span>
          <span className="mx-1">/</span>
          <span>{formatTime(animationState.duration)}</span>
        </div>
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}