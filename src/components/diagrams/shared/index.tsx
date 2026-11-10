import React, { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import type { AnimationState, Language } from '../../../types';
import { gsap, MotionPathPlugin } from '../../../utils/gsapSetup';

export { MotionPathPlugin };

/**
 * Every chapter draws on the same 960x540 coordinate system, so diagrams stay
 * consistent regardless of the screen size they are scaled into.
 */
export const CANVAS = { width: 960, height: 540 } as const;

export const TONE = {
  blue: { fill: '#eff6ff', stroke: '#3b82f6', text: '#1e40af', strong: '#2563eb' },
  green: { fill: '#ecfdf5', stroke: '#10b981', text: '#047857', strong: '#059669' },
  amber: { fill: '#fffbeb', stroke: '#f59e0b', text: '#b45309', strong: '#d97706' },
  purple: { fill: '#f5f3ff', stroke: '#8b5cf6', text: '#6d28d9', strong: '#7c3aed' },
  red: { fill: '#fef2f2', stroke: '#ef4444', text: '#b91c1c', strong: '#dc2626' },
  teal: { fill: '#f0fdfa', stroke: '#14b8a6', text: '#0f766e', strong: '#0d9488' },
  navy: { fill: '#eef2ff', stroke: '#4f46e5', text: '#312e81', strong: '#4338ca' },
  slate: { fill: '#f8fafc', stroke: '#94a3b8', text: '#334155', strong: '#64748b' },
} as const;

export type Tone = keyof typeof TONE;

const MONO = '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
const SANS = 'Inter, Nunito Sans, system-ui, -apple-system, Segoe UI, sans-serif';

export interface BaseProps {
  className?: string;
}

/** Resolves the English/Bengali label for the active language. */
export function useLabel(language: Language) {
  return useCallback((en: string, bn: string) => (language === 'bn' ? bn : en), [language]);
}

/* ------------------------------------------------------------------ *
 * Animation
 * ------------------------------------------------------------------ */

type PlayingState = Pick<AnimationState, 'isPlaying' | 'speed'>;

export type ChapterBuilder = (tl: gsap.core.Timeline, root: SVGSVGElement) => void;

/**
 * Builds the chapter timeline once per play/pause transition.
 *
 * The timeline is always created paused so that `fromTo` end-states are already
 * rendered when the chapter is idle; while paused the diagram is parked on its
 * final frame (with completion callbacks suppressed). Pressing play rebuilds
 * and plays the timeline from the start, which is what makes replay work.
 */
export function useChapterAnimation(
  svgRef: React.RefObject<SVGSVGElement>,
  animationState: PlayingState,
  onAnimationComplete: (() => void) | undefined,
  build: ChapterBuilder,
  /**
   * Chapter length in seconds. When set, the timeline is stretched so the
   * animation finishes exactly when the transport's progress bar reaches 100%.
   */
  fitTo?: number
) {
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const baseScaleRef = useRef(1);
  const buildRef = useRef(build);
  const completeRef = useRef(onAnimationComplete);
  const speedRef = useRef(animationState.speed);

  useEffect(() => {
    buildRef.current = build;
    completeRef.current = onAnimationComplete;
    speedRef.current = animationState.speed;
  });

  const { isPlaying } = animationState;

  useLayoutEffect(() => {
    const root = svgRef.current;
    if (!root) return;

    const timeline = gsap.timeline({
      paused: true,
      onComplete: () => completeRef.current?.(),
    });

    buildRef.current(timeline, root);

    let naturalDuration = timeline.duration();

    // Chapters are authored with ~10-20s of motion but may run for up to two
    // minutes. Padding the tail keeps the motion spread across the whole
    // chapter instead of finishing early and leaving a frozen diagram.
    if (fitTo && naturalDuration > 0) {
      const wanted = fitTo * 0.55;
      const pad = Math.min(wanted - naturalDuration, naturalDuration * 1.5);
      if (pad > 0.25) {
        timeline.to({}, { duration: pad });
        naturalDuration = timeline.duration();
      }
    }

    baseScaleRef.current = fitTo && naturalDuration > 0 ? naturalDuration / fitTo : 1;
    timeline.timeScale(baseScaleRef.current * (speedRef.current || 1));
    timelineRef.current = timeline;

    if (isPlaying) {
      timeline.play(0);
    } else {
      // `true` suppresses onComplete so parking a chapter does not mark it done.
      timeline.progress(1, true);
    }

    return () => {
      timeline.kill();
      if (timelineRef.current === timeline) timelineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, svgRef, fitTo]);

  useEffect(() => {
    timelineRef.current?.timeScale(baseScaleRef.current * (animationState.speed || 1));
  }, [animationState.speed]);
}

export interface FxOptions {
  duration?: number;
  stagger?: number;
  position?: gsap.Position;
  ease?: string;
}

export interface Sketch {
  /** Fades elements in from transparent. */
  fade(selector: string, options?: FxOptions): void;
  /** Fades in while sliding up — the default for headings and cards. */
  rise(selector: string, options?: FxOptions & { y?: number }): void;
  /** Scales elements up from 85% while fading in. */
  pop(selector: string, options?: FxOptions & { scale?: number }): void;
  /** Draws strokes on using a dash offset, no plugin required. */
  draw(selector: string, options?: FxOptions): void;
  /** Glides elements from one point to another, used for packets. */
  glide(
    selector: string,
    options: FxOptions & { from: [number, number]; to: [number, number]; fade?: boolean }
  ): void;
  /** Pulses elements to draw attention to them. */
  pulse(
    selector: string,
    options?: FxOptions & { scale?: number; repeat?: number; transformOrigin?: string }
  ): void;
}

/**
 * Creates tween helpers bound to a timeline and SVG root.
 *
 * `fromTo` tweens keep GSAP's default `immediateRender`, which applies their
 * start state as soon as the timeline is built. That is what makes a paused,
 * freshly-built chapter render correctly: the start states are committed, and
 * parking the playhead at the end then reveals the finished diagram.
 */
export function createFx(tl: gsap.core.Timeline, root: ParentNode): Sketch {
  const select = (selector: string) =>
    Array.from(root.querySelectorAll<SVGElement>(selector));

  const add = (
    selector: string,
    from: gsap.TweenVars,
    to: gsap.TweenVars,
    { duration = 0.5, stagger = 0.08, position, ease = 'power2.out' }: FxOptions
  ) => {
    const targets = select(selector);
    if (!targets.length) return;
    tl.fromTo(targets, { ...from }, { ...to, duration, stagger, ease }, position);
  };

  return {
    fade: (selector, options = {}) =>
      add(selector, { opacity: 0 }, { opacity: 1 }, options),

    rise: (selector, options = {}) => {
      const { y = 22, ...rest } = options;
      add(selector, { opacity: 0, y }, { opacity: 1, y: 0, ease: 'back.out(1.3)' }, rest);
    },

    pop: (selector, options = {}) => {
      const { scale = 0.85, ...rest } = options;
      add(
        selector,
        { opacity: 0, scale, transformOrigin: '50% 50%' },
        { opacity: 1, scale: 1, ease: 'back.out(1.7)' },
        rest
      );
    },

    draw: (selector, options = {}) => {
      const { duration = 0.8, stagger = 0.1, position, ease = 'power2.inOut' } = options;
      select(selector).forEach((element, index) => {
        const geometry = element as unknown as SVGGeometryElement;
        let length = 0;
        try {
          length = geometry.getTotalLength();
        } catch {
          length = 0;
        }
        if (!length) {
          tl.fromTo(
            element,
            { opacity: 0 },
            { opacity: 1, duration, ease },
            typeof position === 'number' ? position + index * stagger : position
          );
          return;
        }
        gsap.set(element, { strokeDasharray: length, strokeDashoffset: length });
        tl.to(
          element,
          { strokeDashoffset: 0, duration, ease },
          typeof position === 'number' ? position + index * stagger : position
        );
      });
    },

    glide: (selector, options) => {
      const { from, to, fade = true, ...rest } = options;
      add(
        selector,
        { x: from[0], y: from[1], opacity: fade ? 0 : 1 },
        { x: to[0], y: to[1], opacity: 1, ease: 'power1.inOut' },
        { duration: 1.6, ...rest }
      );
    },

    pulse: (selector, options = {}) => {
      const { scale = 1.08, repeat = 1, transformOrigin = '50% 50%', ...rest } = options;
      const targets = select(selector);
      if (!targets.length) return;
      const { duration = 0.4, stagger = 0.05, position } = rest;
      targets.forEach((target, index) => {
        const at = typeof position === 'number' ? position + index * stagger : position;
        tl.to(target, { scale, transformOrigin, duration, repeat, yoyo: true, ease: 'sine.inOut' }, at);
      });
    },
  };
}

/* ------------------------------------------------------------------ *
 * Layout primitives
 * ------------------------------------------------------------------ */

export function DiagramSvg({
  svgRef,
  children,
  className,
  label,
  padding = 0,
}: {
  svgRef?: React.Ref<SVGSVGElement>;
  children: React.ReactNode;
  className?: string;
  label?: string;
  /** Inner gutter in user units — 0 keeps diagrams edge to edge. */
  padding?: number;
}) {
  return (
    <div className={`w-full h-full flex items-center justify-center ${className ?? ''}`}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${CANVAS.width} ${CANVAS.height}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full max-h-full"
        role="img"
        aria-label={label}
      >
        <rect x={0} y={0} width={CANVAS.width} height={CANVAS.height} fill="#ffffff" />
        {padding ? (
          <g transform={`translate(${padding} ${padding})`}>{children}</g>
        ) : (
          children
        )}
      </svg>
    </div>
  );
}

export function DiagramHeading({
  x = CANVAS.width / 2,
  y = 44,
  title,
  subtitle,
  className,
  anchor = 'middle',
}: {
  x?: number;
  y?: number;
  title: string;
  subtitle?: string;
  className?: string;
  anchor?: 'start' | 'middle' | 'end';
}) {
  return (
    <g className={className}>
      <text x={x} y={y} textAnchor={anchor} fontFamily={SANS} fontSize={24} fontWeight={700} fill="#0f172a">
        {title}
      </text>
      {subtitle && (
        <text x={x} y={y + 24} textAnchor={anchor} fontFamily={SANS} fontSize={14} fill="#64748b">
          {subtitle}
        </text>
      )}
    </g>
  );
}

export interface NodeCardProps extends BaseProps {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  subtitle?: string;
  lines?: string[];
  tone?: Tone;
  glyph?: string;
  badge?: string;
}

export function NodeCard({
  x,
  y,
  w,
  h,
  title,
  subtitle,
  lines,
  tone = 'blue',
  glyph,
  badge,
  className,
}: NodeCardProps) {
  const palette = TONE[tone];

  // Each row is centred on a computed y so the block stays vertically centred in
  // the card no matter which optional rows are present. Rows are rendered with
  // `dominantBaseline="central"`, which places a row's visual centre on that y.
  const LEADING = 18;
  const GLYPH_LEADING = 28;
  const bodyLines = lines ?? [];
  const rowCount = 1 + (subtitle ? 1 : 0) + bodyLines.length;
  const blockHeight = (glyph ? GLYPH_LEADING : 0) + rowCount * LEADING;

  const centres: number[] = [];
  let cursor = y + (h - blockHeight) / 2;
  if (glyph) {
    centres.push(cursor + GLYPH_LEADING / 2);
    cursor += GLYPH_LEADING;
  }
  const titleIndex = centres.length;
  centres.push(cursor + LEADING / 2);
  cursor += LEADING;
  const subtitleIndex = subtitle ? centres.length : -1;
  if (subtitle) {
    centres.push(cursor + LEADING / 2);
    // Without advancing the cursor the subtitle shared its baseline with the
    // first body row, so the two rows rendered on top of each other.
    cursor += LEADING;
  }
  const lineOffset = centres.length;
  // Body rows were never appended to `centres`, so their `y` fell back to 0 and
  // every card leaked its detail lines into the top-left of the canvas.
  bodyLines.forEach(() => {
    centres.push(cursor + LEADING / 2);
    cursor += LEADING;
  });

  return (
    <g className={className}>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={14}
        fill={palette.fill}
        stroke={palette.stroke}
        strokeWidth={1.6}
      />
      {badge && (
        <g>
          <rect x={x + w - 46} y={y + 8} width={38} height={18} rx={9} fill={palette.stroke} opacity={0.9} />
          <text x={x + w - 27} y={y + 21} textAnchor="middle" fontFamily={SANS} fontSize={10} fontWeight={700} fill="#ffffff">
            {badge}
          </text>
        </g>
      )}
      {glyph && (
        <text
          x={x + w / 2}
          y={centres[0]}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={22}
        >
          {glyph}
        </text>
      )}
      <text
        x={x + w / 2}
        y={centres[titleIndex]}
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily={SANS}
        fontSize={16}
        fontWeight={700}
        fill={palette.text}
      >
        {title}
      </text>
      {subtitle && (
        <text
          x={x + w / 2}
          y={centres[subtitleIndex]}
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily={SANS}
          fontSize={12}
          fill="#64748b"
        >
          {subtitle}
        </text>
      )}
      {bodyLines.map((line, index) => (
        <text
          key={line}
          x={x + w / 2}
          y={centres[lineOffset + index]}
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily={MONO}
          fontSize={11.5}
          fill="#475569"
        >
          {line}
        </text>
      ))}
    </g>
  );
}

export interface ArrowProps extends BaseProps {
  from: [number, number];
  to: [number, number];
  tone?: Tone;
  label?: string;
  labelOffset?: [number, number];
  dashed?: boolean;
  bidirectional?: boolean;
  curve?: number;
  width?: number;
}

export function Arrow({
  from,
  to,
  tone = 'slate',
  label,
  labelOffset = [0, -10],
  dashed = false,
  bidirectional = false,
  curve = 0,
  width = 2,
  className,
}: ArrowProps) {
  const palette = TONE[tone];
  const [x1, y1] = from;
  const [x2, y2] = to;

  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const distance = Math.hypot(dx, dy) || 1;
  const controlX = midX + (-dy / distance) * curve;
  const controlY = midY + (dx / distance) * curve;
  const path = curve
    ? `M ${x1} ${y1} Q ${controlX} ${controlY} ${x2} ${y2}`
    : `M ${x1} ${y1} L ${x2} ${y2}`;

  // The head follows the curve's tangent so curved arrows still point correctly.
  const tangentX = curve ? x2 - controlX : dx;
  const tangentY = curve ? y2 - controlY : dy;
  const angle = (Math.atan2(tangentY, tangentX) * 180) / Math.PI;
  const startAngle = (Math.atan2(curve ? controlY - y1 : dy, curve ? controlX - x1 : dx) * 180) / Math.PI;

  return (
    <g className={className}>
      <path
        className="arrow-line"
        d={path}
        fill="none"
        stroke={palette.stroke}
        strokeWidth={width}
        strokeLinecap="round"
        strokeDasharray={dashed ? '7 6' : undefined}
      />
      <path
        className="arrow-head"
        d="M0,0 L-10,3.6 L-10,-3.6 Z"
        fill={palette.stroke}
        transform={`translate(${x2}, ${y2}) rotate(${angle})`}
      />
      {bidirectional && (
        <path
          className="arrow-head"
          d="M0,0 L-10,3.6 L-10,-3.6 Z"
          fill={palette.stroke}
          transform={`translate(${x1}, ${y1}) rotate(${startAngle + 180})`}
        />
      )}
      {label && (
        <text
          x={curve ? controlX + labelOffset[0] : midX + labelOffset[0]}
          y={curve ? controlY + labelOffset[1] : midY + labelOffset[1]}
          textAnchor="middle"
          fontFamily={SANS}
          fontSize={12}
          fontWeight={600}
          fill={palette.text}
        >
          {label}
        </text>
      )}
    </g>
  );
}

export interface ZoneProps extends BaseProps {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  tone?: Tone;
  dashed?: boolean;
}

export function Zone({ x, y, w, h, title, tone = 'slate', dashed = true, className }: ZoneProps) {
  const palette = TONE[tone];
  return (
    <g className={className}>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={18}
        fill={palette.fill}
        stroke={palette.stroke}
        strokeWidth={1.4}
        strokeDasharray={dashed ? '9 7' : undefined}
        opacity={0.9}
      />
      <rect x={x + 20} y={y - 13} width={Math.max(90, title.length * 8.4 + 26)} height={26} rx={13} fill={palette.stroke} />
      <text
        x={x + 20 + Math.max(90, title.length * 8.4 + 26) / 2}
        y={y + 4}
        textAnchor="middle"
        fontFamily={SANS}
        fontSize={12.5}
        fontWeight={700}
        fill="#ffffff"
      >
        {title}
      </text>
    </g>
  );
}

export interface PillProps extends BaseProps {
  x: number;
  y: number;
  w: number;
  h?: number;
  text: string;
  tone?: Tone;
  fontSize?: number;
}

export function Pill({ x, y, w, h = 30, text, tone = 'blue', fontSize = 13, className }: PillProps) {
  const palette = TONE[tone];
  return (
    <g className={className}>
      <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={palette.fill} stroke={palette.stroke} strokeWidth={1.4} />
      <text
        x={x + w / 2}
        y={y + h / 2 + fontSize * 0.36}
        textAnchor="middle"
        fontFamily={SANS}
        fontSize={fontSize}
        fontWeight={700}
        fill={palette.text}
      >
        {text}
      </text>
    </g>
  );
}

export interface TokenProps extends BaseProps {
  x: number;
  y: number;
  w: number;
  h?: number;
  text: string;
  tone?: Tone;
  fontSize?: number;
}

export function Token({ x, y, w, h = 34, text, tone = 'slate', fontSize = 13, className }: TokenProps) {
  const palette = TONE[tone];
  return (
    <g className={className}>
      <rect x={x} y={y} width={w} height={h} rx={8} fill="#ffffff" stroke={palette.stroke} strokeWidth={1.6} />
      <text
        x={x + w / 2}
        y={y + h / 2 + fontSize * 0.36}
        textAnchor="middle"
        fontFamily={MONO}
        fontSize={fontSize}
        fontWeight={700}
        fill={palette.text}
      >
        {text}
      </text>
    </g>
  );
}

export interface StepPanelProps extends BaseProps {
  x: number;
  y: number;
  w: number;
  steps: string[];
  title?: string;
  tone?: Tone;
  rowHeight?: number;
  maxChars?: number;
  numbered?: boolean;
}

/** Naive word wrap — SVG has no automatic text wrapping. */
export function wrapText(text: string, maxChars: number, maxLines = 2): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';

  words.forEach((word) => {
    if (!line) line = word;
    else if (`${line} ${word}`.length <= maxChars) line = `${line} ${word}`;
    else {
      lines.push(line);
      line = word;
    }
  });
  if (line) lines.push(line);

  if (lines.length <= maxLines) return lines;

  const kept = lines.slice(0, maxLines);
  const last = kept[maxLines - 1];
  kept[maxLines - 1] = last.length >= maxChars ? `${last.slice(0, maxChars - 1)}…` : `${last}…`;
  return kept;
}

export function StepPanel({
  x,
  y,
  w,
  steps,
  title,
  tone = 'blue',
  rowHeight = 40,
  maxChars = 40,
  numbered = true,
  className,
}: StepPanelProps) {
  const palette = TONE[tone];
  const paddingTop = title ? 34 : 12;
  const height = paddingTop + steps.length * rowHeight + 12;

  return (
    <g className={className}>
      <rect x={x} y={y} width={w} height={height} rx={14} fill="#ffffff" stroke="#e2e8f0" strokeWidth={1.5} />
      {title && (
        <text x={x + 16} y={y + 23} fontFamily={SANS} fontSize={13} fontWeight={700} fill={palette.text}>
          {title}
        </text>
      )}
      {steps.map((step, index) => {
        const rowY = y + paddingTop + index * rowHeight;
        const lines = wrapText(step, maxChars);
        return (
          <g key={step} className="step-row">
            <rect
              x={x + 10}
              y={rowY + 3}
              width={w - 20}
              height={rowHeight - 8}
              rx={9}
              fill={index % 2 === 0 ? '#f8fafc' : '#ffffff'}
            />
            {numbered && (
              <>
                <circle cx={x + 28} cy={rowY + (rowHeight - 8) / 2 + 3} r={10.5} fill={palette.stroke} />
                <text
                  x={x + 28}
                  y={rowY + (rowHeight - 8) / 2 + 7}
                  textAnchor="middle"
                  fontFamily={SANS}
                  fontSize={11.5}
                  fontWeight={700}
                  fill="#ffffff"
                >
                  {index + 1}
                </text>
              </>
            )}
            {lines.map((line, lineIndex) => (
              <text
                key={line}
                x={x + (numbered ? 46 : 18)}
                y={rowY + (rowHeight - 8) / 2 + 7 + (lineIndex === 0 ? (lines.length > 1 ? -4 : 0) : 12)}
                fontFamily={SANS}
                fontSize={12}
                fill="#334155"
              >
                {line}
              </text>
            ))}
          </g>
        );
      })}
    </g>
  );
}

export interface CalloutProps extends BaseProps {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  body?: string;
  tone?: Tone;
  glyph?: string;
}

export function Callout({ x, y, w, h, title, body, tone = 'amber', glyph, className }: CalloutProps) {
  const palette = TONE[tone];
  const lines = body ? wrapText(body, Math.max(24, Math.floor(w / 7.2)), 3) : [];

  return (
    <g className={className}>
      <rect x={x} y={y} width={w} height={h} rx={12} fill={palette.fill} stroke={palette.stroke} strokeWidth={1.4} />
      <rect x={x} y={y + 6} width={5} height={h - 12} rx={2.5} fill={palette.stroke} />
      <text x={x + 20} y={y + 26} fontFamily={SANS} fontSize={13} fontWeight={700} fill={palette.text}>
        {glyph ? `${glyph} ${title}` : title}
      </text>
      {lines.map((line, index) => (
        <text key={line} x={x + 20} y={y + 46 + index * 16} fontFamily={SANS} fontSize={12} fill="#475569">
          {line}
        </text>
      ))}
    </g>
  );
}

export interface LayerRowProps extends BaseProps {
  x: number;
  y: number;
  w: number;
  h?: number;
  label: string;
  detail?: string;
  tone?: Tone;
  glyph?: string;
  value?: string;
}

export function LayerRow({
  x,
  y,
  w,
  h = 38,
  label,
  detail,
  tone = 'slate',
  glyph,
  value,
  className,
}: LayerRowProps) {
  const palette = TONE[tone];
  return (
    <g className={className}>
      <rect x={x} y={y} width={w} height={h} rx={9} fill={palette.fill} stroke={palette.stroke} strokeWidth={1.3} />
      <text x={x + 14} y={y + h / 2 + 4.5} fontFamily={SANS} fontSize={12.5} fontWeight={700} fill={palette.text}>
        {glyph ? `${glyph} ${label}` : label}
      </text>
      {detail && (
        <text x={x + w - 14} y={y + h / 2 + 4.5} textAnchor="end" fontFamily={MONO} fontSize={11.5} fill="#475569">
          {value ? `${detail} ${value}` : detail}
        </text>
      )}
    </g>
  );
}

export interface CodeBoxProps extends BaseProps {
  x: number;
  y: number;
  w: number;
  h: number;
  title?: string;
  lines: string[];
  tone?: Tone;
}

export function CodeBox({ x, y, w, h, title, lines, tone = 'navy', className }: CodeBoxProps) {
  const palette = TONE[tone];
  return (
    <g className={className}>
      <rect x={x} y={y} width={w} height={h} rx={12} fill="#0f172a" />
      <rect x={x} y={y} width={w} height={title ? 28 : 10} rx={title ? 12 : 5} fill={palette.strong} />
      {title && (
        <text x={x + 14} y={y + 19} fontFamily={MONO} fontSize={11.5} fontWeight={700} fill="#ffffff">
          {title}
        </text>
      )}
      {lines.map((line, index) => (
        <text
          key={line}
          x={x + 14}
          y={y + (title ? 50 : 32) + index * 17}
          fontFamily={MONO}
          fontSize={11.5}
          fill="#e2e8f0"
        >
          {line}
        </text>
      ))}
    </g>
  );
}

/* ------------------------------------------------------------------ *
 * Attacker lens — the security-researcher read on every diagram
 * ------------------------------------------------------------------ */

export interface AttackerLensProps extends BaseProps {
  x?: number;
  y?: number;
  w?: number;
  title: string;
  surface: string;
  vector: string;
  defender: string;
}

/**
 * Red strip pinned to the bottom of a chapter canvas.
 *
 * Three columns answer the questions a pentester actually asks: what is exposed
 * (attack surface), how it gets abused (attack vector) and which control stops
 * it (defender focus).
 */
export function AttackerLens({
  x = 8,
  y = 396,
  w = CANVAS.width - 16,
  title,
  surface,
  vector,
  defender,
  className,
}: AttackerLensProps) {
  const h = CANVAS.height - y - 14;
  const columns = [
    { glyph: '🎯', label: 'ATTACK SURFACE', body: surface },
    { glyph: '⚔️', label: 'HOW IT IS EXPLOITED', body: vector },
    { glyph: '🛡️', label: 'DEFENDER FOCUS', body: defender },
  ];
  const columnW = (w - 32) / 3;

  return (
    <g className={className}>
      <rect x={x} y={y} width={w} height={h} rx={14} fill="#fef2f2" stroke="#ef4444" strokeWidth={1.6} />
      <path
        d={`M ${x} ${y + 16} Q ${x} ${y} ${x + 16} ${y} L ${x + w - 16} ${y} Q ${x + w} ${y} ${x + w} ${y + 16} L ${x + w} ${y + 30} L ${x} ${y + 30} Z`}
        fill="#dc2626"
      />
      <text x={x + 16} y={y + 20} fontFamily={SANS} fontSize={12.5} fontWeight={700} fill="#ffffff">
        🔐 {title}
      </text>
      {columns.map((column, index) => {
        const columnX = x + 16 + index * columnW;
        const lines = wrapText(column.body, Math.max(26, Math.floor(columnW / 5.9)), 3);
        return (
          <g key={column.label}>
            {index > 0 && (
              <line
                x1={columnX - 10}
                y1={y + 42}
                x2={columnX - 10}
                y2={y + h - 14}
                stroke="#fecaca"
                strokeWidth={1.4}
              />
            )}
            <text x={columnX} y={y + 54} fontFamily={SANS} fontSize={10.5} fontWeight={700} fill="#b91c1c">
              {column.glyph} {column.label}
            </text>
            {lines.map((line, lineIndex) => (
              <text key={line} x={columnX} y={y + 72 + lineIndex * 15} fontFamily={SANS} fontSize={11.5} fill="#7f1d1d">
                {line}
              </text>
            ))}
          </g>
        );
      })}
    </g>
  );
}
