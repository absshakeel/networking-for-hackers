import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from './store';
import { PresentationHeader } from './components/presentation/PresentationHeader';
import { ChapterRenderer } from './components/presentation/ChapterRenderer';
import { ChapterNavigation } from './components/navigation/ChapterNavigation';
import { PlaybackControls } from './components/presentation/PlaybackControls';
import { ProgressIndicator } from './components/presentation/ProgressIndicator';
import { LanguageSwitcher } from './components/ui/LanguageSwitcher';
import { PresenterModeToggle } from './components/ui/PresenterModeToggle';
import { KeyboardShortcuts } from './components/ui/KeyboardShortcuts';
import { usePlaybackEngine } from './hooks/usePlaybackEngine';

function App() {
  const { t, i18n } = useTranslation();
  usePlaybackEngine();
  const { 
    currentChapter, 
    currentModule, 
    language, 
    isFullscreen, 
    reducedMotion,
    modules,
    setFullscreen,
  } = useAppStore();
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    i18n.changeLanguage(language);
    document.documentElement.lang = language;
    document.documentElement.dir = 'ltr';
  }, [language, i18n]);
  
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNowFullscreen = !!document.fullscreenElement;
      if (isNowFullscreen !== isFullscreen) {
        setFullscreen(isNowFullscreen);
      }
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [isFullscreen, setFullscreen]);
  
  const handleFullscreenToggle = async () => {
    if (!isFullscreen && containerRef.current) {
      try {
        await containerRef.current.requestFullscreen();
      } catch (err) {
        console.warn('Fullscreen request failed:', err);
      }
    } else if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch (err) {
        console.warn('Exit fullscreen failed:', err);
      }
    }
  };
  
  const currentChapterData = modules
    .flatMap(m => m.chapters)
    .find(c => c.id === currentChapter);
  
  const currentModuleData = modules.find(m => m.id === currentModule);
  
  return (
    <div 
      ref={containerRef}
      className="presentation-container flex flex-col"
      role="application"
      aria-label={t('label')}
    >
      <PresentationHeader
        moduleTitle={currentModuleData?.title || ''}
        chapterTitle={currentChapterData?.title || ''}
        chapterNumber={currentChapter}
        totalChapters={modules.flatMap(m => m.chapters).length}
        onFullscreenToggle={handleFullscreenToggle}
        isFullscreen={isFullscreen}
      />
      
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden" role="main">
        <div className="flex-1 flex flex-col min-h-0">
          <ChapterRenderer 
            chapterId={currentChapter}
            reducedMotion={reducedMotion}
          />
        </div>
        
        <div className="flex-shrink-0 border-t border-slate-200 bg-white">
          <PlaybackControls />
        </div>
      </main>
      
      <footer className="flex-shrink-0 border-t border-slate-200 bg-white flex flex-col min-h-0 max-h-[45vh]">
        <div className="flex items-center justify-between px-6 py-3 gap-4 flex-wrap">
          <ProgressIndicator />
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <PresenterModeToggle />
          </div>
        </div>
        
        <ChapterNavigation />
      </footer>
      
      <KeyboardShortcuts />
    </div>
  );
}

export default App;