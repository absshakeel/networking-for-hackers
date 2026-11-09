import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store';

export function PlaybackControls() {
  const { t } = useTranslation();
  const { 
    animationState, 
    setAnimationState, 
  } = useAppStore();
  
  const { isPlaying, currentTime, duration, speed } = animationState;
  
  const handlePlayPause = () => {
    setAnimationState({ isPlaying: !isPlaying });
  };
  
  const handleReplay = () => {
    setAnimationState({ 
      currentTime: 0, 
      progress: 0, 
      isPlaying: true 
    });
  };
  
  const handleStepForward = () => {
    const step = duration / 100;
    setAnimationState({ 
      currentTime: Math.min(currentTime + step, duration),
      isPlaying: false 
    });
  };
  
  const handleStepBackward = () => {
    const step = duration / 100;
    setAnimationState({ 
      currentTime: Math.max(currentTime - step, 0),
      isPlaying: false 
    });
  };
  
  const handleSpeedChange = (newSpeed: number) => {
    setAnimationState({ speed: newSpeed });
  };
  
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only progress is sent; the store derives currentTime and restarts playback
    // because the chapter animations cannot be seeked frame-accurately.
    setAnimationState({ progress: Number(e.target.value) });
  };
  
  return (
    <div className="px-4 py-2 bg-white border-t border-slate-200">
      <div className="max-w-full mx-auto flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
            <button
              onClick={handleStepBackward}
              disabled={currentTime <= 0}
              className="btn-icon p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50"
              aria-label={t('step') + ' back'}
              aria-disabled={currentTime <= 0}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={handleReplay}
              className="btn-icon p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100"
              aria-label={t('replayAnimation')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            
            <button
              onClick={handlePlayPause}
              className="btn-icon p-2.5 rounded-xl bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-lg shadow-primary-600/25"
              aria-label={isPlaying ? t('pauseAnimation') : t('playAnimation')}
              aria-pressed={isPlaying}
            >
              {isPlaying ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
            
            <button
              onClick={handleStepForward}
              disabled={currentTime >= duration}
              className="btn-icon p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50"
              aria-label={t('step') + ' forward'}
              aria-disabled={currentTime >= duration}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
        </div>
          
        <div className="flex-1 min-w-[200px] flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={100}
            value={animationState.progress}
            onChange={handleProgressChange}
            className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            aria-label={t('progress')}
            aria-valuenow={Math.round(animationState.progress)}
            aria-valuemin={0}
            aria-valuemax={100}
          />
          
          <div className="flex items-center gap-1 text-sm text-slate-500 font-mono tabular-nums min-w-[96px]">
            <span>{formatTime(currentTime)}</span>
            <span>/</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{t('speed')}</span>
          <select
            value={speed}
            onChange={(e) => handleSpeedChange(Number(e.target.value))}
            className="text-sm px-2 py-1 rounded bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer appearance-none"
            aria-label={t('animationSpeed')}
          >
            <option value={0.25}>{t('slow')} (0.25x)</option>
            <option value={0.5}>0.5x</option>
            <option value={1}>{t('normal')} (1x)</option>
            <option value={1.5}>1.5x</option>
            <option value={2}>{t('fast')} (2x)</option>
          </select>
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