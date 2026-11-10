import type { ChapterDefinition } from '../definitions';

const ch1: ChapterDefinition = {
  id: 'ch1',
  eyebrow: 'Chapter 01 · Networking Foundations',
  title: 'How Computer Networks Communicate',
  subtitle: 'Four hops turn a click into bytes on a wire — and every hop is attackable.',
  duration: 30,
  nodes: [
    {
      id: 'host',
      x: 20,
      y: 164,
      w: 128,
      h: 112,
      title: 'Your Laptop',
      subtitle: '192.168.1.24',
      lines: ['browser → OS stack'],
      tone: 'blue',
      glyph: '💻',
    },
    {
      id: 'switch',
      x: 200,
      y: 164,
      w: 128,
      h: 112,
      title: 'LAN Switch',
      subtitle: 'Layer 2, same subnet',
      lines: ['MAC table lookup'],
      tone: 'teal',
      glyph: '🔀',
    },
    {
      id: 'router',
      x: 380,
      y: 164,
      w: 128,
      h: 112,
      title: 'Gateway',
      subtitle: '192.168.1.1',
      lines: ['NAT + routing'],
      tone: 'amber',
      glyph: '🛰️',
    },
    {
      id: 'server',
      x: 560,
      y: 164,
      w: 128,
      h: 112,
      title: 'Web Server',
      subtitle: '93.184.216.34',
      lines: ['TLS · :443'],
      tone: 'purple',
      glyph: '🖥️',
    },
  ],
  edges: [
    { from: 'host', to: 'switch', label: 'frame', tone: 'blue' },
    { from: 'switch', to: 'router', label: 'frame', tone: 'teal' },
    { from: 'router', to: 'server', label: 'packet', tone: 'purple', dashed: true },
  ],
  packet: { from: 'host', to: 'server', label: 'GET /', tone: 'red' },
  beats: [
    {
      title: 'Encapsulate',
      body: 'Data is wrapped L7 to L4 to L3 to L2, each layer adding its own header.',
      tone: 'blue',
    },
    {
      title: 'Switch locally',
      body: 'The frame stays inside the subnet; the switch forwards on the destination MAC.',
      tone: 'teal',
    },
    {
      title: 'Route outward',
      body: 'Anything off-subnet goes to the gateway, which NATs the private source IP.',
      tone: 'purple',
    },
  ],
  panel: {
    title: 'HOP FACTS',
    rows: [
      { label: 'Handshake', detail: 'TCP', value: ':443', tone: 'blue' },
      { label: 'Resolution', detail: 'DNS', value: 'A/AAAA', tone: 'teal' },
      { label: 'Hop limit', detail: 'TTL', value: '64', tone: 'amber' },
      { label: 'Subnet', detail: '/24', value: '254 hosts', tone: 'slate' },
      { label: 'Trust', detail: 'none', value: 'by default', tone: 'red' },
    ],
  },
  lens: {
    title: 'Attackers see three soft spots',
    surface:
      'Cleartext DNS on UDP/53, ARP with no authentication, and a flat /24 where every host can talk to every other host.',
    vector:
      'ARP spoof the gateway to sit in the middle, poison DNS to redirect the request, then sniff plaintext HTTP or downgrade TLS.',
    defender:
      'Dynamic ARP inspection, DHCP snooping, DoH/DoT, and segment the subnet so one foothold cannot reach the whole LAN.',
  },
};

export const CHAPTER_DEFINITIONS: Record<number, ChapterDefinition> = {
  1: ch1,
};