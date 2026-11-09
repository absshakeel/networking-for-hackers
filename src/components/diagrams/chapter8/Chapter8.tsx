import React, { useRef } from 'react';
import { DiagramProps } from '../../../types';
import {
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

/** Left edge and width of each octet box in the IPv4 column. */
const OCTET_X = 73;
const OCTET_W = 84;
const OCTET_GAP = 6;
const octetLeft = (index: number) => OCTET_X + index * (OCTET_W + OCTET_GAP);
const octetCentre = (index: number) => octetLeft(index) + OCTET_W / 2;

const IPV4_OCTETS = ['192', '168', '1', '25'];
const IPV4_BINARY = '11000000.10101000.00000001.00011001';
const IPV6_GROUPS = ['2001', '0db8', '0000', '0000', '0000', '8a2e', '0370', '7334'];

const Chapter = React.memo(function Chapter({ language, animationState, onAnimationComplete }: DiagramProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const l = useLabel(language);

  useChapterAnimation(
    svgRef,
    animationState,
    onAnimationComplete,
    (tl, root) => {
      const fx = createFx(tl, root);

      // --- IPv4: the dotted address decomposes into octets, then into bits ---
      fx.rise('.ch8-heading', { duration: 0.7 });
      fx.fade('.ch8-zone', { duration: 0.7, position: 0.7 });
      fx.pop('.ch8-v4-addr', { duration: 0.7, position: 1.6 });
      fx.pop('.ch8-v4-octet', { duration: 0.5, stagger: 0.15, position: 2.5, ease: 'back.out(2)' });
      fx.draw('.ch8-v4-split', { duration: 0.8, position: 4 });
      fx.fade('.ch8-v4-note', { duration: 0.6, position: 4.8 });
      fx.fade('.ch8-v4-bits', { duration: 0.9, position: 5.4 });
      fx.draw('.ch8-v4-bracket', { duration: 0.6, position: 6.3 });
      fx.rise('.ch8-v4-part', { duration: 0.6, stagger: 1, position: 6.6 });
      fx.fade('.ch8-v4-prefix', { duration: 0.6, position: 8.8 });
      fx.pulse('.ch8-v4-addr', { duration: 0.6, position: 9.6 });

      // --- IPv6: the same idea, stretched to 128 bits ---
      fx.pop('.ch8-v6-addr', { duration: 0.8, position: 10.6 });
      fx.fade('.ch8-v6-expanded', { duration: 0.7, position: 11.5 });
      fx.fade('.ch8-v6-note', { duration: 0.6, position: 12.3 });
      fx.pop('.ch8-v6-group', { duration: 0.45, stagger: 0.1, position: 13, ease: 'back.out(2)' });
      fx.rise('.ch8-v6-row', { duration: 0.6, stagger: 1, position: 15 });
      fx.fade('.ch8-v6-tail', { duration: 0.6, position: 17 });
      fx.pulse('.ch8-v6-addr', { duration: 0.6, position: 17.8 });

      // --- Closing comparison ---
      fx.rise('.ch8-fact', { duration: 0.6, stagger: 0.9, position: 18.8 });
      fx.pulse('.ch8-v4-addr, .ch8-v6-addr', { duration: 0.7, position: 21.6 });
    },
    DURATION
  );

  return (
    <DiagramSvg svgRef={svgRef} label={l('IPv4 and IPv6 addressing', 'IPv4 এবং IPv6 অ্যাড্রেসিং')}>
      <DiagramHeading
        className="ch8-heading"
        title={l('IP Addressing — IPv4 and IPv6', 'IP অ্যাড্রেসিং — IPv4 এবং IPv6')}
        subtitle={l(
          'A logical address stays with the device, no matter which network it joins',
          'লজিক্যাল অ্যাড্রেস ডিভাইস যত নেটওয়ার্কেই যোগ দিক না কেন তার সাথেই থাকে'
        )}
      />

      {/* ---------------------------- IPv4 ---------------------------- */}
      <Zone
        className="ch8-zone"
        x={40}
        y={104}
        w={420}
        h={344}
        tone="blue"
        title={l('IPv4 — 32 bits', 'IPv4 — ৩২ বিট')}
      />

      <Token
        className="ch8-v4-addr"
        x={73}
        y={128}
        w={354}
        h={46}
        tone="blue"
        fontSize={21}
        text="192.168.1.25"
      />

      {IPV4_OCTETS.map((octet, index) => (
        <Token
          key={`octet-${index}`}
          className="ch8-v4-octet"
          x={octetLeft(index)}
          y={188}
          w={OCTET_W}
          h={36}
          tone="navy"
          fontSize={15}
          text={octet}
        />
      ))}

      <line className="ch8-v4-split" x1={73} y1={180} x2={427} y2={180} stroke="#93c5fd" strokeWidth={1.5} />
      {IPV4_OCTETS.map((_, index) => (
        <line
          key={`tick-${index}`}
          className="ch8-v4-split"
          x1={octetCentre(index)}
          y1={180}
          x2={octetCentre(index)}
          y2={188}
          stroke="#93c5fd"
          strokeWidth={1.5}
        />
      ))}

      <text
        className="ch8-v4-note"
        x={250}
        y={258}
        textAnchor="middle"
        fontFamily="Inter, system-ui, sans-serif"
        fontSize={12.5}
        fill="#64748b"
      >
        {l('4 octets × 8 bits = 32 bits', '৪ অক্টেট × ৮ বিট = ৩২ বিট')}
      </text>

      <text
        className="ch8-v4-bits"
        x={250}
        y={286}
        textAnchor="middle"
        fontFamily="ui-monospace, Menlo, monospace"
        fontSize={12.5}
        fill="#334155"
      >
        {IPV4_BINARY}
      </text>

      <path
        className="ch8-v4-bracket"
        d="M 148 300 L 148 306 L 352 306 L 352 300"
        fill="none"
        stroke="#3b82f6"
        strokeWidth={1.5}
      />

      <LayerRow
        className="ch8-v4-part"
        x={73}
        y={314}
        w={354}
        h={42}
        label={l('Network part', 'নেটওয়ার্ক অংশ')}
        detail="192.168.1.0/24"
        tone="blue"
        glyph="⇢"
      />
      <LayerRow
        className="ch8-v4-part"
        x={73}
        y={366}
        w={354}
        h={42}
        label={l('Host part', 'হোস্ট অংশ')}
        detail=".25"
        tone="green"
        glyph="⇠"
      />

      <text
        className="ch8-v4-prefix"
        x={250}
        y={432}
        textAnchor="middle"
        fontFamily="Inter, system-ui, sans-serif"
        fontSize={12}
        fill="#64748b"
      >
        {l('/24 → the first 24 bits name the network', '/24 → প্রথম ২৪ বিট নেটওয়ার্ক চিহ্নিত করে')}
      </text>

      {/* ---------------------------- IPv6 ---------------------------- */}
      <Zone
        className="ch8-zone"
        x={500}
        y={104}
        w={420}
        h={344}
        tone="purple"
        title={l('IPv6 — 128 bits', 'IPv6 — ১২৮ বিট')}
      />

      <Token
        className="ch8-v6-addr"
        x={533}
        y={128}
        w={354}
        h={46}
        tone="purple"
        fontSize={17}
        text="2001:db8::8a2e:370:7334"
      />

      <Token
        className="ch8-v6-expanded"
        x={533}
        y={188}
        w={354}
        h={36}
        tone="slate"
        fontSize={11.5}
        text="2001:0db8:0000:0000:0000:8a2e:0370:7334"
      />

      <text
        className="ch8-v6-note"
        x={710}
        y={248}
        textAnchor="middle"
        fontFamily="Inter, system-ui, sans-serif"
        fontSize={12.5}
        fill="#64748b"
      >
        {l('8 groups × 16 bits = 128 bits', '৮ গ্রুপ × ১৬ বিট = ১২৮ বিট')}
      </text>

      {IPV6_GROUPS.map((group, index) => (
        <Token
          key={`group-${index}`}
          className="ch8-v6-group"
          x={533 + (index % 4) * 91}
          y={index < 4 ? 262 : 296}
          w={85}
          h={28}
          tone={index >= 2 && index <= 4 ? 'slate' : 'navy'}
          fontSize={12}
          text={group}
        />
      ))}

      <LayerRow
        className="ch8-v6-row"
        x={533}
        y={344}
        w={354}
        h={42}
        label={l('Address space', 'অ্যাড্রেস স্পেস')}
        detail="≈ 3.4 × 10³⁸"
        tone="purple"
        glyph="∞"
      />
      <LayerRow
        className="ch8-v6-row"
        x={533}
        y={396}
        w={354}
        h={42}
        label={l('NAT required', 'NAT প্রয়োজন')}
        detail={l('No', 'না')}
        tone="green"
        glyph="✓"
      />

      <text
        className="ch8-v6-tail"
        x={710}
        y={460}
        textAnchor="middle"
        fontFamily="Inter, system-ui, sans-serif"
        fontSize={12}
        fill="#64748b"
      >
        {l('Tilde notation `::` collapses one run of zero groups', 'টিল্ড নোটেশন `::` একটানা শূন্য গ্রুপ সংক্ষেপ করে')}
      </text>

      {/* --------------------------- Summary -------------------------- */}
      <Pill
        className="ch8-fact"
        x={40}
        y={478}
        w={270}
        h={44}
        tone="blue"
        fontSize={12.5}
        text="IPv4 · 2³² ≈ 4.3 billion"
      />
      <Pill
        className="ch8-fact"
        x={345}
        y={478}
        w={270}
        h={44}
        tone="purple"
        fontSize={12.5}
        text="IPv6 · 2¹²⁸ ≈ 3.4 × 10³⁸"
      />
      <Pill
        className="ch8-fact"
        x={650}
        y={478}
        w={270}
        h={44}
        tone="teal"
        fontSize={12.5}
        text={l('Logical — not burned into hardware', 'লজিক্যাল — হার্ডওয়্যারে লেখা নয়')}
      />
    </DiagramSvg>
  );
});

export default Chapter;