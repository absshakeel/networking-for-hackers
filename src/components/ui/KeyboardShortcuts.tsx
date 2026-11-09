import { useEffect } from 'react';
import { useAppStore } from '../../store';

export function KeyboardShortcuts() {
  const { 
    nextChapter, 
    previousChapter, 
    setAnimationState, 
    animationState,
    toggleFullscreen,
    setFullscreen,
    currentChapter,
    modules,
  } = useAppStore();
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          nextChapter();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          previousChapter();
          break;
        case ' ':
          e.preventDefault();
          setAnimationState({ isPlaying: !animationState.isPlaying });
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          const chapter = modules.flatMap(m => m.chapters).find(c => c.id === currentChapter);
          if (chapter) {
            setAnimationState({ currentTime: 0, progress: 0, isPlaying: true });
          }
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'Escape':
          if (document.fullscreenElement) {
            e.preventDefault();
            setFullscreen(false);
            document.exitFullscreen();
          }
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [animationState.isPlaying, currentChapter, modules, nextChapter, previousChapter, setAnimationState, toggleFullscreen, setFullscreen]);
  
  return null;
}