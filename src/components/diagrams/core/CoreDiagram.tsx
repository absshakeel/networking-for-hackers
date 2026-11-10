import { useMemo, useRef } from 'react';
import type { DiagramProps } from '../../../types';
import {
  Arrow,
  AttackerLens,
  CANVAS,
  createFx,
  DiagramSvg,
  LayerRow,
  NodeCard,
  TONE,
  useChapterAnimation,
  wrapText,
} from '../shared';
import { BANDS, NODE_DEFAULT, type ChapterDefinition, type EdgeDef, type NodeDef } from '../../../data/definitions';

const SANS = 'Inter, Nunito Sans, system-ui, -apple-system, Segoe UI, sans-serif';
const MONO = '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
  cx: number;
  cy: number;
}

/** Resolves a node to an absolute box, filling in default width/height. */
function boxOf(node: NodeDef): Rect {
  const w = node.w ?? NODE_DEFAULT.w;
  const h = node.h ?? NODE_DEFAULT.h;
  return { x: node.x, y: node.y, w, h, cx: node.x + w / 2, cy: node.y + h / 2 };
}

/**
 * Picks the anchor pair that gives the shortest, least cluttered wire: side
 * anchors for horizontal neighbours, top/bottom anchors for vertical ones.
 */
function anchors(a: Rect, b: Rect): { from: [number, number]; to: [number, number] } {
  const dx = b.cx - a.cx;
  const dy = b.cy - a.cy;

  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0
      ? { from: [a.x + a.w, a.cy], to: [b.x, b.cy] }
      : { from: [a.x, a.cy], to: [b.x + b.w, b.cy] };
  }
  return dy >= 0
    ? { from: [a.cx, a.y + a.h], to: [b.cx, b.y] }
    : { from: [a.cx, a.y], to: [b.cx, b.y + b.h] };
}

export interface CoreDiagramProps extends DiagramProps {
  definition: ChapterDefinition;
}

/**
 * The single renderer behind every chapter.
 *
 * It draws fixed bands (header, node field, protocol rail, beat strip, attacker
 * lens) and animates them with one timeline. All animation selectors are scoped
 * with the definition id via `data-ch`, so several instances on one page never
 * animate each other.
 */
export default function CoreDiagram({
  definition,
  animationState,
  onAnimationComplete,
}: CoreDiagramProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const scope = (name: string) => `[data-ch="${definition.id}-${name}"]`;

  const rects = useMemo(() => {
    const map = new Map<string, Rect>();
    definition.nodes.forEach((node) => map.set(node.id, boxOf(node)));
    return map;
  }, [definition.nodes]);

  const beatWidth = (CANVAS.width - BANDS.gutter * 2 - 14 * (definition.beats.length - 1)) / definition.beats.length;

  useChapterAnimation(
    svgRef,
    animationState,
    onAnimationComplete,
    (tl, root) => {
      const fx = createFx(tl, root);

      fx.draw(`${scope('edge')} .arrow-line`, { duration: 0.7, stagger: 0.1, position: 0.1 });
      fx.fade(`${scope('edge')} .arrow-head`, { duration: 0.3, stagger: 0.1, position: 0.55 });
      fx.pop(scope('node'), { duration: 0.55, stagger: 0.1, position: 0.7 });

      if (definition.packet) {
        const from = rects.get(definition.packet.from);
        const to = rects.get(definition.packet.to);
        if (from && to) {
          fx.glide(scope('packet'), {
            from: [from.cx, from.cy],
            to: [to.cx, to.cy],
            duration: 1.8,
            position: 1.5,
          });
        }
      }

      fx.rise(scope('beat'), { duration: 0.5, stagger: 0.22, y: 14, position: 2.1 });
      fx.rise(scope('fact'), { duration: 0.45, stagger: 0.1, y: 12, position: 2.5 });
      fx.fade(scope('lens'), { duration: 0.7, position: 3.3 });
      fx.pulse(scope('node'), {
        duration: 0.5,
        scale: 1.04,
        repeat: 0,
        position: 3.9,
        transformOrigin: '50% 50%',
      });
    },
    definition.duration
  );

  return (
    <DiagramSvg svgRef={svgRef} label={`${definition.title} — ${definition.subtitle}`}>
      {/* ---- header band ---- */}
      <rect x={0} y={0} width={CANVAS.width} height={4} fill="#dc2626" />
      <text x={BANDS.gutter} y={34} fontFamily={MONO} fontSize={11.5} fontWeight={700} fill="#dc2626" letterSpacing={1.4}>
        {definition.eyebrow.toUpperCase()}
      </text>
      <text x={BANDS.gutter} y={66} fontFamily={SANS} fontSize={27} fontWeight={800} fill="#0f172a">
        {definition.title}
      </text>
      <text x={BANDS.gutter} y={90} fontFamily={SANS} fontSize={13.5} fill="#64748b">
        {definition.subtitle}
      </text>
      <line x1={BANDS.gutter} y1={BANDS.header} x2={CANVAS.width - BANDS.gutter} y2={BANDS.header} stroke="#e2e8f0" strokeWidth={1.5} />

      {/* ---- wires ---- */}
      {definition.edges.map((edge: EdgeDef, index) => {
        const a = rects.get(edge.from);
        const b = rects.get(edge.to);
        if (!a || !b) return null;
        const { from, to } = anchors(a, b);
        return (
          <g key={`${edge.from}-${edge.to}`} data-ch={`${definition.id}-edge`}>
            <Arrow
              from={from}
              to={to}
              tone={edge.tone ?? 'slate'}
              label={edge.label}
              dashed={edge.dashed}
              bidirectional={edge.bidirectional}
              curve={edge.curve ?? 0}
              labelOffset={[0, -9]}
              className={`edge-${index}`}
            />
          </g>
        );
      })}

      {/* ---- node field ---- */}
      {definition.nodes.map((node) => {
        const rect = rects.get(node.id);
        if (!rect) return null;
        return (
          <g key={node.id} data-ch={`${definition.id}-node`}>
            <NodeCard
              x={rect.x}
              y={rect.y}
              w={rect.w}
              h={rect.h}
              title={node.title}
              subtitle={node.subtitle}
              lines={node.lines}
              tone={node.tone ?? 'blue'}
              glyph={node.glyph}
              badge={node.badge}
            />
          </g>
        );
      })}

      {/* ---- travelling packet ---- */}
      {definition.packet && (
        <g data-ch={`${definition.id}-packet`}>
          <circle cx={0} cy={0} r={9} fill={TONE[definition.packet.tone ?? 'red'].stroke} opacity={0.25} />
          <circle cx={0} cy={0} r={5} fill={TONE[definition.packet.tone ?? 'red'].stroke} />
          {definition.packet.label && (
            <text x={0} y={-14} textAnchor="middle" fontFamily={MONO} fontSize={10.5} fontWeight={700} fill={TONE[definition.packet.tone ?? 'red'].text}>
              {definition.packet.label}
            </text>
          )}
        </g>
      )}

      {/* ---- protocol rail ---- */}
      <g>
        <rect
          x={BANDS.panelX}
          y={BANDS.nodeTop}
          width={BANDS.panelWidth}
          height={BANDS.nodeBottom - BANDS.nodeTop}
          rx={12}
          fill="#ffffff"
          stroke="#e2e8f0"
          strokeWidth={1.5}
        />
        <rect x={BANDS.panelX} y={BANDS.nodeTop} width={BANDS.panelWidth} height={28} rx={12} fill="#0f172a" />
        <rect x={BANDS.panelX} y={BANDS.nodeTop + 14} width={BANDS.panelWidth} height={14} fill="#0f172a" />
        <text x={BANDS.panelX + 14} y={BANDS.nodeTop + 19} fontFamily={MONO} fontSize={11} fontWeight={700} fill="#ffffff">
          {definition.panel.title}
        </text>
        {definition.panel.rows.map((row, index) => (
          <g key={row.label} data-ch={`${definition.id}-fact`}>
            <LayerRow
              x={BANDS.panelX + 12}
              y={BANDS.nodeTop + 38 + index * 36}
              w={BANDS.panelWidth - 24}
              h={30}
              label={row.label}
              detail={row.detail}
              value={row.value}
              tone={row.tone ?? 'slate'}
              glyph={row.glyph}
            />
          </g>
        ))}
      </g>

      {/* ---- narration beats ---- */}
      {definition.beats.map((beat, index) => {
        const x = BANDS.gutter + index * (beatWidth + 14);
        const palette = TONE[beat.tone ?? 'blue'];
        const lines = wrapText(beat.body, Math.floor(beatWidth / 6.4), 2);
        return (
          <g key={beat.title} data-ch={`${definition.id}-beat`}>
            <rect x={x} y={BANDS.beatTop} width={beatWidth} height={BANDS.beatHeight} rx={10} fill="#ffffff" stroke="#e2e8f0" strokeWidth={1.4} />
            <rect x={x} y={BANDS.beatTop} width={4} height={BANDS.beatHeight} rx={2} fill={palette.stroke} />
            <circle cx={x + 22} cy={BANDS.beatTop + 18} r={9} fill={palette.stroke} />
            <text x={x + 22} y={BANDS.beatTop + 22} textAnchor="middle" fontFamily={SANS} fontSize={10.5} fontWeight={700} fill="#ffffff">
              {index + 1}
            </text>
            <text x={x + 38} y={BANDS.beatTop + 22} fontFamily={SANS} fontSize={12.5} fontWeight={700} fill="#0f172a">
              {beat.title}
            </text>
            {lines.map((line, lineIndex) => (
              <text key={line} x={x + 14} y={BANDS.beatTop + 40 + lineIndex * 14} fontFamily={SANS} fontSize={11} fill="#64748b">
                {line}
              </text>
            ))}
          </g>
        );
      })}

      {/* ---- attacker lens ---- */}
      <g data-ch={`${definition.id}-lens`}>
        <AttackerLens
          x={BANDS.gutter}
          y={BANDS.lensTop}
          w={CANVAS.width - BANDS.gutter * 2}
          title={definition.lens.title}
          surface={definition.lens.surface}
          vector={definition.lens.vector}
          defender={definition.lens.defender}
        />
      </g>
    </DiagramSvg>
  );
}