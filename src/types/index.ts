export type Language = 'en' | 'bn';

export interface TranslationKeys {
  // General
  appTitle: string;
  subtitle: string;
  description: string;
  label: string;
  
  // Navigation
  previousChapter: string;
  nextChapter: string;
  playAnimation: string;
  pauseAnimation: string;
  replayAnimation: string;
  animationSpeed: string;
  fullscreen: string;
  exitFullscreen: string;
  chapterNavigation: string;
  progress: string;
  languageToggle: string;
  presenterMode: string;
  
  // Chapters
  chapter: string;
  of: string;
  module: string;
  
  // Common terms
  client: string;
  server: string;
  router: string;
  switch: string;
  packet: string;
  frame: string;
  segment: string;
  protocol: string;
  network: string;
  internet: string;
  lan: string;
  wan: string;
  interface: string;
  node: string;
  device: string;
  communication: string;
  request: string;
  response: string;
  send: string;
  receive: string;
  connection: string;
  data: string;
  header: string;
  payload: string;
  trailer: string;
  encapsulation: string;
  decapsulation: string;
  
  // Chapter titles (abbreviated)
  chapter1: string;
  chapter2: string;
  chapter3: string;
  chapter4: string;
  chapter5: string;
  chapter6: string;
  chapter7: string;
  chapter8: string;
  chapter9: string;
  chapter10: string;
  chapter11: string;
  chapter12: string;
  chapter13: string;
  chapter14: string;
  chapter15: string;
  chapter16: string;
  chapter17: string;
  chapter18: string;
  chapter19: string;
  chapter20: string;
  chapter21: string;
  chapter22: string;
  chapter23: string;
  chapter24: string;
  chapter25: string;
  chapter26: string;
  chapter27: string;
  chapter28: string;
  chapter29: string;
  chapter30: string;
  
  // Module titles
  module1: string;
  module2: string;
  module3: string;
  module4: string;
  module5: string;
  module6: string;
  module7: string;
  
  // Learning structure
  introduce: string;
  visualize: string;
  animate: string;
  explain: string;
  inspect: string;
  summarize: string;
  connect: string;
  keyTakeaways: string;
  relatedChapters: string;
  technicalDetails: string;
  
  // Controls
  speed: string;
  slow: string;
  normal: string;
  fast: string;
  step: string;
  reset: string;
  
  // Status
  loading: string;
  ready: string;
  playing: string;
  paused: string;
  completed: string;
}

export interface Chapter {
  id: number;
  moduleId: number;
  moduleTitle: string;
  title: string;
  description: string;
  component: string;
  duration: number; // estimated animation duration in seconds
}

export interface Module {
  id: number;
  title: string;
  subtitle: string;
  chapters: Chapter[];
}

export interface AnimationState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  speed: number;
  progress: number;
}

export interface AppState {
  currentChapter: number;
  currentModule: number;
  language: Language;
  isFullscreen: boolean;
  animationState: AnimationState;
  completedChapters: number[];
  presenterMode: boolean;
  reducedMotion: boolean;
}

export interface DiagramProps {
  width: number;
  height: number;
  language: Language;
  animationState: AnimationState;
  onAnimationComplete?: () => void;
  onStepChange?: (step: number) => void;
}