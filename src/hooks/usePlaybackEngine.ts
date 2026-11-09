import { useEffect } from 'react';
import { useAppStore } from '../store';

/**
 * How often the clock is written to the store. The GSAP timelines run on their
 * own ticker, so throttling only affects the progress bar / time readout — and
 * it keeps the whole React tree from re-rendering on every frame.
 */
const STORE_WRITE_INTERVAL_MS = 66;

/**
 * Drives the presentation clock. Chapters only react to `animationState.isPlaying`
 * and `animationState.speed`, so the store's `currentTime` / `progress` must be
 * advanced here for the transport controls to behave like a real player.
 */
export function usePlaybackEngine() {
  const animationState = useAppStore((state) => state.animationState);
  const setAnimationState = useAppStore((state) => state.setAnimationState);
  const markChapterComplete = useAppStore((state) => state.markChapterComplete);
  const currentChapter = useAppStore((state) => state.currentChapter);

  const { isPlaying, duration, speed } = animationState;

  useEffect(() => {
    if (!isPlaying || duration <= 0) return;

    let frameId = 0;
    let lastFrame = performance.now();
    let lastWrite = lastFrame;
    let pendingSeconds = 0;

    const flush = (deltaSeconds: number) => {
      pendingSeconds += deltaSeconds;

      const state = useAppStore.getState().animationState;
      if (Date.now() - lastWrite < STORE_WRITE_INTERVAL_MS) return false;

      const nextTime = Math.min(state.currentTime + pendingSeconds, state.duration);
      pendingSeconds = 0;
      lastWrite = Date.now();

      setAnimationState({
        currentTime: nextTime,
        progress: state.duration > 0 ? (nextTime / state.duration) * 100 : 0,
      });

      return nextTime >= state.duration;
    };

    const tick = (now: number) => {
      const deltaSeconds = ((now - lastFrame) / 1000) * speed;
      lastFrame = now;

      if (useAppStore.getState().animationState.isPlaying === false) return;

      if (flush(deltaSeconds)) {
        setAnimationState({ isPlaying: false });
        markChapterComplete(currentChapter);
        return;
      }

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, duration, speed, currentChapter, setAnimationState, markChapterComplete]);

  // Keep the document's reduced-motion preference in sync with the store.
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;

    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => useAppStore.getState().setReducedMotion(query.matches);

    apply();
    query.addEventListener('change', apply);
    return () => query.removeEventListener('change', apply);
  }, []);
}
