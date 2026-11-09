import { useEffect, Suspense, lazy, Component } from 'react';
import { useAppStore } from '../../store';
import { DiagramWrapper } from './DiagramWrapper';
import { ChapterLoading } from './ChapterLoading';
import { ChapterError } from './ChapterError';

const chapterComponents: Record<string, ReturnType<typeof lazy>> = {
  Chapter1: lazy(() => import('../../components/diagrams/chapter1/Chapter1')),
  Chapter2: lazy(() => import('../../components/diagrams/chapter2/Chapter2')),
  Chapter3: lazy(() => import('../../components/diagrams/chapter3/Chapter3')),
  Chapter4: lazy(() => import('../../components/diagrams/chapter4/Chapter4')),
  Chapter5: lazy(() => import('../../components/diagrams/chapter5/Chapter5')),
  Chapter6: lazy(() => import('../../components/diagrams/chapter6/Chapter6')),
  Chapter7: lazy(() => import('../../components/diagrams/chapter7/Chapter7')),
  Chapter8: lazy(() => import('../../components/diagrams/chapter8/Chapter8')),
  Chapter9: lazy(() => import('../../components/diagrams/chapter9/Chapter9')),
  Chapter10: lazy(() => import('../../components/diagrams/chapter10/Chapter10')),
  Chapter11: lazy(() => import('../../components/diagrams/chapter11/Chapter11')),
  Chapter12: lazy(() => import('../../components/diagrams/chapter12/Chapter12')),
  Chapter13: lazy(() => import('../../components/diagrams/chapter13/Chapter13')),
  Chapter14: lazy(() => import('../../components/diagrams/chapter14/Chapter14')),
  Chapter15: lazy(() => import('../../components/diagrams/chapter15/Chapter15')),
  Chapter16: lazy(() => import('../../components/diagrams/chapter16/Chapter16')),
  Chapter17: lazy(() => import('../../components/diagrams/chapter17/Chapter17')),
  Chapter18: lazy(() => import('../../components/diagrams/chapter18/Chapter18')),
  Chapter19: lazy(() => import('../../components/diagrams/chapter19/Chapter19')),
  Chapter20: lazy(() => import('../../components/diagrams/chapter20/Chapter20')),
  Chapter21: lazy(() => import('../../components/diagrams/chapter21/Chapter21')),
  Chapter22: lazy(() => import('../../components/diagrams/chapter22/Chapter22')),
  Chapter23: lazy(() => import('../../components/diagrams/chapter23/Chapter23')),
  Chapter24: lazy(() => import('../../components/diagrams/chapter24/Chapter24')),
  Chapter25: lazy(() => import('../../components/diagrams/chapter25/Chapter25')),
  Chapter26: lazy(() => import('../../components/diagrams/chapter26/Chapter26')),
  Chapter27: lazy(() => import('../../components/diagrams/chapter27/Chapter27')),
  Chapter28: lazy(() => import('../../components/diagrams/chapter28/Chapter28')),
  Chapter29: lazy(() => import('../../components/diagrams/chapter29/Chapter29')),
  Chapter30: lazy(() => import('../../components/diagrams/chapter30/Chapter30')),
};

interface ChapterRendererProps {
  chapterId: number;
  reducedMotion: boolean;
}

export function ChapterRenderer({ chapterId, reducedMotion }: ChapterRendererProps) {
  const { modules, animationState, setAnimationState, markChapterComplete, language } = useAppStore();
  
  const chapter = modules.flatMap(m => m.chapters).find(c => c.id === chapterId);
  const LazyComponent = chapter ? chapterComponents[chapter.component] : null;
  
  useEffect(() => {
    if (chapter) {
      setAnimationState({ duration: chapter.duration, currentTime: 0, progress: 0 });
    }
  }, [chapterId, setAnimationState]);
  
  useEffect(() => {
    if (animationState.isPlaying && animationState.currentTime >= animationState.duration) {
      markChapterComplete(chapterId);
      setAnimationState({ isPlaying: false });
    }
  }, [animationState.currentTime, animationState.duration, animationState.isPlaying, chapterId, markChapterComplete, setAnimationState]);
  
  if (!chapter || !LazyComponent) {
    return (
      <div className="diagram-area flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-slate-900 mb-1">Chapter {chapterId}</h3>
          <p className="text-slate-500 text-sm">Chapter component not found</p>
        </div>
      </div>
    );
  }
  
  return (
    <DiagramWrapper 
      chapter={chapter}
      animationState={animationState}
      reducedMotion={reducedMotion}
    >
      <Suspense fallback={<ChapterLoading />}>
        <ErrorBoundary>
          <LazyComponent 
            key={chapterId}
            language={language}
            animationState={animationState}
            onAnimationComplete={() => markChapterComplete(chapterId)}
          />
        </ErrorBoundary>
      </Suspense>
    </DiagramWrapper>
  );
}

class ErrorBoundary extends Component<{ children: React.ReactNode }, { error: Error | null }> {
  state = { error: null };
  
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Chapter render error:', error, errorInfo);
  }
  
  render() {
    if (this.state.error) {
      return <ChapterError error={this.state.error} onRetry={() => this.setState({ error: null })} />;
    }
    return this.props.children;
  }
}