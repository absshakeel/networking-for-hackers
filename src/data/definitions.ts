import type { Tone } from '../components/diagrams/shared';

/**
 * Declarative chapter schema.
 *
 * Chapters are pure data: a definition describes the boxes, the wires, the
 * narration beats, the protocol facts and the attacker lens. `CoreDiagram`
 * renders every one of them through the same layout engine, which is what keeps
 * thirty chapters visually identical and guarantees nothing overflows the
 * 960x540 canvas.
 */

/** A box on the canvas. Coordinates are absolute, in canvas units. */
export interface NodeDef {
  /** Unique inside the definition — edges refer to it. */
  id: string;
  x: number;
  y: number;
  w?: number;
  h?: number;
  title: string;
  subtitle?: string;
  /** Extra monospace detail rows, e.g. addresses or commands. */
  lines?: string[];
  tone?: Tone;
  glyph?: string;
  badge?: string;
}

/** A wire between two nodes. Anchors are derived from relative positions. */
export interface EdgeDef {
  from: string;
  to: string;
  label?: string;
  tone?: Tone;
  dashed?: boolean;
  bidirectional?: boolean;
  curve?: number;
}

/** A narration beat in the strip under the node band. */
export interface Beat {
  title: string;
  body: string;
  tone?: Tone;
}

/** The right-hand protocol fact rail. */
export interface ProtocolPanel {
  title: string;
  rows: Array<{
    label: string;
    detail?: string;
    value?: string;
    tone?: Tone;
    glyph?: string;
  }>;
}

export interface AttackerLensContent {
  title: string;
  surface: string;
  vector: string;
  defender: string;
}

/** The animated token travelling along the path. */
export interface PacketDef {
  from: string;
  to: string;
  label?: string;
  tone?: Tone;
}

export interface ChapterDefinition {
  /** Short stable id used to scope animation selectors. */
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  nodes: NodeDef[];
  edges: EdgeDef[];
  packet?: PacketDef;
  beats: Beat[];
  panel: ProtocolPanel;
  lens: AttackerLensContent;
  /** Chapter length in seconds — drives the transport bar and timeline stretch. */
  duration: number;
}

/**
 * Horizontal bands of the canvas. Every definition must keep its content inside
 * these bounds — the renderer never reflows, so overflowing coordinates clip.
 *
 *   header   0  -> 104
 *   nodes    116 -> 332   (left: 20 -> 692, right rail: 712 -> 940)
 *   beats    346 -> 406
 *   lens     418 -> 526
 */
export const BANDS = {
  header: 104,
  nodeTop: 116,
  nodeBottom: 332,
  nodeLeft: 20,
  nodeRight: 692,
  panelX: 712,
  panelWidth: 228,
  beatTop: 346,
  beatHeight: 60,
  lensTop: 418,
  gutter: 20,
} as const;

/** Usable drawing area for nodes, exposed so definitions stay inside it. */
export const NODE_SPACE = {
  left: BANDS.nodeLeft,
  top: BANDS.nodeTop,
  width: BANDS.nodeRight - BANDS.nodeLeft,
  height: BANDS.nodeBottom - BANDS.nodeTop,
} as const;

/** Defaults applied when a node omits its size. */
export const NODE_DEFAULT = { w: 150, h: 78 } as const;