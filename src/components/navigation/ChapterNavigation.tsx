import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store';
import { Module, Chapter } from '../../types';

export function ChapterNavigation() {
  const { t } = useTranslation();
  const { modules, currentChapter, currentModule, setCurrentChapter, completedChapters, language, animationState } = useAppStore();
  const [expandedModules, setExpandedModules] = React.useState<Record<number, boolean>>({});
  const [navOpen, setNavOpen] = React.useState(false);
  const [initialised, setInitialised] = React.useState(false);
  
  // Start with only the active module open so the footer cannot squash the stage.
  React.useEffect(() => {
    if (initialised || !modules.length) return;
    setExpandedModules({ [currentModule]: true });
    setInitialised(true);
  }, [initialised, modules, currentModule]);
  
  // Keep the module that owns the active chapter open when navigating.
  React.useEffect(() => {
    if (!initialised) return;
    setExpandedModules(prev => (prev[currentModule] ? prev : { ...prev, [currentModule]: true }));
  }, [initialised, currentModule]);
  
  const toggleModule = (moduleId: number) => {
    setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };
  
  const isCompleted = (chapterId: number) => completedChapters.includes(chapterId);
  const isCurrent = (chapterId: number) => currentChapter === chapterId;
  
  const totalChapters = modules.reduce((sum, m) => sum + m.chapters.length, 0);
  const completedCount = completedChapters.length;
  
  return (
    <nav className="border-t border-slate-200 bg-white flex-1 min-h-0 flex flex-col" role="navigation" aria-label={t('chapterNavigation')}>
      <div className="flex items-center justify-between gap-4 px-4 py-2 flex-shrink-0">
        <button
          type="button"
          onClick={() => setNavOpen(open => !open)}
          className="btn-ghost gap-2 px-3 py-1.5 text-sm text-slate-600"
          aria-expanded={navOpen}
          aria-controls="chapter-navigation-list"
        >
          <svg
            className={`w-4 h-4 transition-transform ${navOpen ? '' : '-rotate-90'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          <span className="font-medium">{t('chapterNavigation')}</span>
          <span className="text-xs text-slate-400 font-mono tabular-nums">
            {completedCount}/{totalChapters}
          </span>
        </button>
        
        <button
          type="button"
          onClick={() => setNavOpen(open => !open)}
          className="text-xs text-slate-500 hover:text-slate-800 md:hidden"
        >
          {navOpen ? t('hideChapters') : t('showChapters')}
        </button>
      </div>
      
      <div
        id="chapter-navigation-list"
        hidden={!navOpen}
        className="flex-1 min-h-0 overflow-y-auto px-4 pb-3 scrollbar-thin"
      >
        <div className="space-y-2">
          {modules.map((module) => (
            <ModuleSection
              key={module.id}
              module={module}
              isExpanded={expandedModules[module.id]}
              onToggle={() => toggleModule(module.id)}
              currentModule={currentModule}
              isCompleted={isCompleted}
              isCurrent={isCurrent}
              onChapterClick={(id) => {
                setCurrentChapter(id);
                setNavOpen(false);
              }}
              language={language}
              t={t}
              isPlaying={animationState.isPlaying}
            />
          ))}
        </div>
      </div>
    </nav>
  );
}

interface ModuleSectionProps {
  module: Module;
  isExpanded: boolean;
  onToggle: () => void;
  currentModule: number;
  isCompleted: (id: number) => boolean;
  isCurrent: (id: number) => boolean;
  onChapterClick: (id: number) => void;
  language: 'en' | 'bn';
  t: (key: string) => string;
  isPlaying: boolean;
}

function ModuleSection({ 
  module, 
  isExpanded, 
  onToggle, 
  currentModule,
  isCompleted, 
  isCurrent, 
  onChapterClick, 
  language,
  t,
  isPlaying
}: ModuleSectionProps) {
  const moduleTitle = language === 'bn' ? t(`module${module.id}`) : module.title;
  const isActiveModule = currentModule === module.id;
  
  return (
    <div className="group">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        aria-expanded={isExpanded}
        style={{ 
          backgroundColor: isActiveModule ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
          borderColor: isActiveModule ? 'rgba(37, 99, 235, 0.2)' : 'transparent',
        }}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span className={`font-medium text-sm transition-transform ${isExpanded ? '' : 'rotate-90'}`}>
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
          <span className={`font-semibold text-sm truncate ${isActiveModule ? 'text-primary-700' : 'text-slate-700'}`}>
            {t('module')} {module.id}: {moduleTitle}
          </span>
          <span className="text-xs text-slate-400 font-mono tabular-nums">
            {module.chapters.filter(c => isCompleted(c.id)).length}/{module.chapters.length}
          </span>
        </div>
      </button>
      
      {isExpanded && (
        <div className="mt-1 ml-7 border-l border-slate-200 pl-3 space-y-1 animate-slide-down">
          {module.chapters.map((chapter) => (
            <ChapterNavItem
              key={chapter.id}
              chapter={chapter}
              isCompleted={isCompleted(chapter.id)}
              isCurrent={isCurrent(chapter.id)}
              onClick={() => onChapterClick(chapter.id)}
              language={language}
              t={t}
              isPlaying={isPlaying}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ChapterNavItemProps {
  chapter: Chapter;
  isCompleted: boolean;
  isCurrent: boolean;
  onClick: () => void;
  language: 'en' | 'bn';
  t: (key: string) => string;
  isPlaying: boolean;
}

function ChapterNavItem({ chapter, isCompleted, isCurrent, onClick, language, t, isPlaying }: ChapterNavItemProps) {
  const chapterTitle = language === 'bn' ? t(`chapter${chapter.id}`) : chapter.title;
  
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
        isCurrent
          ? 'bg-primary-50 border border-primary-200 text-primary-700'
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }`}
      aria-current={isCurrent ? 'true' : 'false'}
    >
      <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium transition-all">
        {isCompleted ? (
          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        ) : isCurrent ? (
          <span className="w-4 h-4 bg-primary-600 text-white rounded-full flex items-center justify-center">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </span>
        ) : (
          <span className="text-slate-400 font-mono tabular-nums">{chapter.id}</span>
        )}
      </div>
      <span className="text-sm truncate font-medium">{chapterTitle}</span>
      {isCurrent && (
        <span className="flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-primary-100 text-primary-700">
          {isPlaying ? t('playing') : t('current')}
        </span>
      )}
    </button>
  );
}