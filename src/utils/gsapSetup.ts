import gsap from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

/**
 * GSAP plugins must be registered once before any timeline uses them.
 * Without this, `motionPath` tweens silently do nothing.
 */
gsap.registerPlugin(MotionPathPlugin);

export { gsap, MotionPathPlugin };
