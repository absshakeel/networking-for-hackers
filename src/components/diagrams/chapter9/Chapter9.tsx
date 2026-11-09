import React, { useRef } from 'react';
import { DiagramProps } from '../../../types';
import {
  Arrow,
  DiagramHeading,
  DiagramSvg,
  LayerRow,
  Pill,
  Token,
  Zone,
  createFx,
  useChapterAnimation,
  useLabel,
} from '../shared';

const DURATION = 30;

const PRIVATE_RANGES: Array<{ range: string; size: string; tone: 'blue' | 'green' | 'amber' }> = [
  { range: '10.0.0.0/8', size: '16.7 M', tone: 'blue' },
  { range: '172.16.0.0/12', size: '1.0 M', tone: 'green' },
  { range: '192.168.0.0/16', size: '65 536', tone: 'amber' },
];

const Chapter = React.memo(function Chapter({ language, animationState, onAnimationComplete }: DiagramProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const l = useLabel(language);

  useChapterAnimation(
    svgRef,
    animationState,
    onAnimationComplete,
    (tl, root) => {
      const fx = createFx(tl, root);

      fx.rise('.ch9-heading', { duration: 0.7 });
      fx.fade('.ch9-zone', { duration: 0.7, position: 0.7 });

      // --- private address space ---
      fx.pop('.ch9-priv-token', { duration: 0.7, position: 1.6 });
      fx.pop('.ch9-range', { duration: 0.55, stagger: 0.6, position: 2.6 });
      fx.fade('.ch9-priv-note', { duration: 0.6, position: 4.6 });

      // --- request leaving the LAN ---
      fx.pop('.ch9-client', { duration: 0.6, position: 5.4 });
      fx.draw('.ch9-lan-link', { duration: 0.6, position: 6 });
      fx.pop('.ch9-router', { duration: 0.6, position: 6.6 });
      fx.draw('.ch9-wan-link', { duration: 0.6, position: 7.2 });
      fx.pop('.ch9-server', { duration: 0.6, position: 7.8 });
      fx.fade('.ch9-packet-out', { duration: 0.7, position: 8.4 });

      // --- NAT rewrites the packet ---
      fx.fade('.ch9-fields', { duration: 0.6, position: 9.6 });
      fx.fade('.ch9-field-old', { duration: 0.5, position: 10.2 });
      fx.pulse('.ch9-nat', { duration: 0.7, position: 11 });
      fx.draw('.ch9-translate', { duration: 0.7, position: 11.4 });
      fx.pop('.ch9-field-new', { duration: 0.6, position: 12.2 });
      fx.pulse('.ch9-router', { duration: 0.6, position: 13 });

      // --- translation table ---
      fx.fade('.ch9-table', { duration: 0.7, position: 14 });
      fx.rise('.ch9-table-row', { duration: 0.5, stagger: 0.7, position: 14.6 });

      // --- why it matters ---
      fx.rise('.ch9-reason', { duration: 0.6, stagger: 0.9, position: 18 });
      fx.fade('.ch9-callout', { duration: 0.8, position: 20.4 });
      fx.pulse('.ch9-callout', { duration: 0.7, position: 21.4 });
    },
    DURATION
  );

  return (
    <DiagramSvg
      svgRef={svgRef}
      label={l('Public and private IP addresses with NAT', 'পাবলিক ও প্রাইভেট IP অ্যাড্রেস NAT সহ')}
    >
      <DiagramHeading
        className="ch9-heading"
        title={l('Public vs Private IP — and NAT', 'পাবলিক বনাম প্রাইভেট IP — এবং NAT')}
        subtitle={l(
          'Private addresses are reused inside every home and office; NAT lets them share one public address',
          'প্রাইভেট অ্যাড্রেস প্রতিটি বাসা ও অফিসে পুনরায় ব্যবহৃত হয়; NAT তাদের একটি পাবলিক অ্যাড্রেস ভাগ করতে দেয়'
        )}
      />

      {/* ---------------------- Private ranges ---------------------- */}
      <Zone
        className="ch9-zone"
        x={40}
        y={100}
        w={330}
        h={252}
        tone="blue"
        title={l('Private (RFC 1918)', 'প্রাইভেট (RFC 1918)')}
      />

      <Token
        className="ch9-priv-token"
        x={73}
        y={132}
        w={154}
        h={34}
        tone="blue"
        fontSize={13}
        text={l('not routable', 'রাউটেবল নয়')}
      />

      {PRIVATE_RANGES.map((item, index) => (
        <LayerRow
          key={item.range}
          className="ch9-range"
          x={73}
          y={186 + index * 52}
          w={264}
          h={44}
          label={item.range}
          detail={item.size}
          tone={item.tone}
          glyph="⌂"
        />
      ))}

      <text
        className="ch9-priv-note"
        x={205}
        y={332}
        textAnchor="middle"
        fontFamily="Inter, system-ui, sans-serif"
        fontSize={11.5}
        fill="#64748b"
      >
        {l('Same numbers everywhere — never on the Internet', 'সব জায়গায় একই সংখ্যা — ইন্টারনেটে কখনো নয়')}
      </text>

      {/* ------------------------- The path ------------------------- */}
      <Zone
        className="ch9-zone"
        x={394}
        y={100}
        w={526}
        h={158}
        tone="slate"
        title={l('How a private host reaches the Internet', 'প্রাইভেট হোস্ট কীভাবে ইন্টারনেটে পৌঁছায়')}
      />

      <Token
        className="ch9-client"
        x={414}
        y={152}
        w={126}
        h={56}
        tone="navy"
        fontSize={12}
        text={l('Laptop', 'ল্যাপটপ')}
      />
      <text
        className="ch9-client"
        x={477}
        y={222}
        textAnchor="middle"
        fontFamily="ui-monospace, Menlo, monospace"
        fontSize={11}
        fill="#475569"
      >
        192.168.1.25
      </text>

      <line className="ch9-lan-link" x1={540} y1={180} x2={586} y2={180} stroke="#94a3b8" strokeWidth={2} />

      <Token
        className="ch9-router"
        x={586}
        y={148}
        w={132}
        h={64}
        tone="amber"
        fontSize={12}
        text={l('NAT router', 'NAT রাউটার')}
      />
      <text
        className="ch9-router"
        x={652}
        y={228}
        textAnchor="middle"
        fontFamily="ui-monospace, Menlo, monospace"
        fontSize={11}
        fill="#b45309"
      >
        203.0.113.7
      </text>

      <line className="ch9-wan-link" x1={718} y1={180} x2={764} y2={180} stroke="#94a3b8" strokeWidth={2} />

      <Token
        className="ch9-server"
        x={764}
        y={152}
        w={134}
        h={56}
        tone="teal"
        fontSize={12}
        text={l('Web server', 'ওয়েব সার্ভার')}
      />
      <text
        className="ch9-server"
        x={831}
        y={222}
        textAnchor="middle"
        fontFamily="ui-monospace, Menlo, monospace"
        fontSize={11}
        fill="#0f766e"
      >
        93.184.216.34
      </text>

      <text
        className="ch9-packet-out"
        x={657}
        y={250}
        textAnchor="middle"
        fontFamily={l('Inter, system-ui, sans-serif', 'Noto Sans Bengali, Inter, sans-serif')}
        fontSize={12}
        fill="#334155"
      >
        {l(
          'The server only ever sees 203.0.113.7',
          'সার্ভার কেবল 203.0.113.7 দেখে'
        )}
      </text>

      {/* ------------------------- Translation ------------------------- */}
      <Zone
        className="ch9-zone"
        x={40}
        y={344}
        w={526}
        h={136}
        tone="amber"
        title={l('What NAT rewrites', 'NAT কী পরিবর্তন করে')}
      />

      <text
        className="ch9-fields"
        x={73}
        y={378}
        fontFamily="Inter, system-ui, sans-serif"
        fontSize={11.5}
        fill="#64748b"
        letterSpacing="0.08em"
      >
        {l('SOURCE ADDRESS : PORT', 'সোর্স অ্যাড্রেস : পোর্ট')}
      </text>

      <Token
        className="ch9-field-old"
        x={73}
        y={390}
        w={158}
        h={40}
        tone="slate"
        fontSize={12.5}
        text="192.168.1.25:53114"
      />

      <Arrow className="ch9-translate" from={[245, 410]} to={[303, 410]} tone="amber" label="NAT" />

      <Token
        className="ch9-field-new"
        x={317}
        y={390}
        w={168}
        h={40}
        tone="amber"
        fontSize={12.5}
        text="203.0.113.7:40001"
      />

      <text
        className="ch9-fields"
        x={73}
        y={456}
        fontFamily="Inter, system-ui, sans-serif"
        fontSize={11.5}
        fill="#64748b"
      >
        {l(
          'On the way back the router reverses the mapping from its table',
          'ফিরতি পথে রাউটার তার টেবিল থেকে ম্যাপিং উল্টে দেয়'
        )}
      </text>

      {/* ------------------------ Session table ------------------------ */}
      <Zone
        className="ch9-table"
        x={586}
        y={344}
        w={334}
        h={96}
        tone="green"
        title={l('NAT translation table', 'NAT অনুবাদ টেবিল')}
      />

      <LayerRow
        className="ch9-table-row"
        x={608}
        y={372}
        w={290}
        h={34}
        label="192.168.1.25:53114"
        detail="→ :40001"
        tone="green"
        glyph="↔"
      />
      <LayerRow
        className="ch9-table-row"
        x={608}
        y={410}
        w={290}
        h={34}
        label="192.168.1.26:53114"
        detail="→ :40002"
        tone="green"
        glyph="↔"
      />

      {/* --------------------------- Why --------------------------- */}
      <Pill
        className="ch9-reason"
        x={40}
        y={496}
        w={266}
        h={36}
        tone="blue"
        fontSize={12}
        text={l('Saves IPv4 addresses', 'IPv4 অ্যাড্রেস বাঁচায়')}
      />
      <Pill
        className="ch9-reason"
        x={320}
        y={496}
        w={266}
        h={36}
        tone="amber"
        fontSize={12}
        text={l('Hides internal topology', 'ভেতরের টপোলজি লুকায়')}
      />
      <Pill
        className="ch9-reason"
        x={600}
        y={496}
        w={320}
        h={36}
        tone="red"
        fontSize={12}
        text={l('Needs port forwarding for inbound', 'ইনবাউন্ডের জন্য পোর্ট ফরওয়ার্ডিং দরকার')}
      />
    </DiagramSvg>
  );
});

export default Chapter;