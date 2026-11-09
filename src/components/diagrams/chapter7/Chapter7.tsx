import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { DiagramProps } from '../../../types';

interface ARPHost {
  id: string;
  name: string;
  ip: string;
  mac: string;
  x: number;
  y: number;
}

const hosts: ARPHost[] = [
  { id: 'hostA', name: 'Host A', ip: '192.168.1.10', mac: '00:1A:2B:3C:4D:5E', x: 150, y: 200 },
  { id: 'hostB', name: 'Host B', ip: '192.168.1.20', mac: '00:1A:2B:3C:4D:5F', x: 550, y: 200 },
  { id: 'router', name: 'Router (Gateway)', ip: '192.168.1.1', mac: '00:1A:2B:3C:4D:60', x: 750, y: 200 },
];

const arpSteps = [
  { step: 1, title: 'Host A wants to send to Host B', description: 'Application needs Host B\'s MAC' },
  { step: 2, title: 'Check ARP Cache', description: 'No entry for 192.168.1.20' },
  { step: 3, title: 'Broadcast ARP Request', description: 'Who has 192.168.1.20? Tell 192.168.1.10' },
  { step: 4, title: 'Host B Receives Request', description: 'Recognizes its IP, prepares reply' },
  { step: 5, title: 'Unicast ARP Reply', description: 'Host B MAC is 00:1A:2B:3C:4D:5F' },
  { step: 6, title: 'Cache Updated', description: 'Host A stores mapping, sends frame' },
];

const remoteSteps = [
  { step: 1, title: 'Host A wants to send to 8.8.8.8', description: 'Destination is outside subnet' },
  { step: 2, title: 'Check Routing Table', description: 'Default gateway: 192.168.1.1' },
  { step: 3, title: 'ARP for Gateway', description: 'Who has 192.168.1.1? Tell 192.168.1.10' },
  { step: 4, title: 'Router Replies', description: 'Gateway MAC is 00:1A:2B:3C:4D:60' },
  { step: 5, title: 'Frame to Gateway', description: 'Dst MAC = Router, Dst IP = 8.8.8.8' },
];

export const Chapter7 = React.memo(function Chapter7({ 
  language, 
  animationState, 
  onAnimationComplete 
}: Chapter7Props) {
  const { t } = useTranslation();
  const svgRef = useRef<SVGSVGElement>(null);
  const animationRef = useRef<gsap.core.Timeline | null>(null);
  const [mode, setMode] = useState<'local' | 'remote'>('local');
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({
        onComplete: () => {
          onAnimationComplete?.();
        },
        onUpdate: () => {
          // const progress = Math.round(timeline.progress() * (mode === 'local' ? 5 : 4));
        },
      });
      
      animationRef.current = timeline;
      
      // Handle initial state based on playing status
      if (animationState.isPlaying) {
        // Animation will play - set initial hidden state
        gsap.set('.host', { opacity: 0, scale: 0.8 });
        gsap.set('.switch', { opacity: 0, scale: 0.8 });
        gsap.set('.arp-packet', { opacity: 0 });
        gsap.set('.step-box', { opacity: 0, scale: 0.9 });
        gsap.set('.cache-entry', { opacity: 0, x: -20 });
        gsap.set('.arp-fields', { opacity: 0, y: 10 });
        gsap.set('.frame-sent', { opacity: 0 });
        gsap.set('.cache-miss', { opacity: 0 });
        gsap.set('.cache-entry-new', { opacity: 0, x: -20 });
      } else {
        // Not playing - show everything immediately
        gsap.set('.host', { opacity: 1, scale: 1 });
        gsap.set('.switch', { opacity: 1, scale: 1 });
        gsap.set('.arp-packet', { opacity: 1 });
        gsap.set('.step-box', { opacity: 1, scale: 1 });
        gsap.set('.cache-entry', { opacity: 1, x: 0 });
        gsap.set('.arp-fields', { opacity: 1, y: 0 });
        gsap.set('.frame-sent', { opacity: 1 });
        gsap.set('.cache-miss', { opacity: 1 });
        gsap.set('.cache-entry-new', { opacity: 1, x: 0 });
      }
      
      if (animationState.isPlaying) {
        // Initial setup
        gsap.set('.host', { opacity: 0, scale: 0.8 });
        gsap.set('.switch', { opacity: 0, scale: 0.8 });
        gsap.set('.arp-packet', { opacity: 0 });
        gsap.set('.step-box', { opacity: 0, scale: 0.9 });
        gsap.set('.cache-entry', { opacity: 0, x: -20 });
        gsap.set('.arp-fields', { opacity: 0, y: 10 });
        gsap.set('.frame-sent', { opacity: 0 });
        gsap.set('.cache-miss', { opacity: 0 });
        gsap.set('.cache-entry-new', { opacity: 0, x: -20 });
        
        // Network appears
        timeline.to('.host, .switch', { 
          opacity: 1, 
          scale: 1, 
          duration: 0.5, 
          stagger: 0.1,
          ease: 'back.out(1.5)'
        });
        
        if (mode === 'local') {
          
          // Step 1: Host A wants to send
          timeline.to('.step-box-1', { opacity: 1, scale: 1, duration: 0.4 }, '+=0.5');
          timeline.to('.host-a-highlight', { stroke: '#2563eb', strokeWidth: 3, duration: 0.3 }, '-=0.1');
          
          // Step 2: Check ARP cache
          timeline.to('.step-box-2', { opacity: 1, scale: 1, duration: 0.4 }, '+=0.8');
          timeline.to('.cache-miss', { opacity: 1, duration: 0.3 }, '-=0.1');
          
          // Step 3: Broadcast ARP Request
          timeline.to('.step-box-3', { opacity: 1, scale: 1, duration: 0.4 }, '+=0.8');
          timeline.to('.arp-request-packet', { 
            opacity: 1,
            motionPath: {
              path: '#path-broadcast',
              align: '#path-broadcast',
              autoRotate: 90,
              start: 0,
              end: 1,
            },
            duration: 2,
            ease: 'power1.inOut'
          }, '-=0.1');
          timeline.to('.arp-fields-request', { opacity: 1, y: 0, duration: 0.3 }, '-=0.5');
          
          // Step 4: Host B receives
          timeline.to('.step-box-4', { opacity: 1, scale: 1, duration: 0.4 }, '+=1.5');
          timeline.to('.host-b-highlight', { stroke: '#22c55e', strokeWidth: 3, duration: 0.3 }, '-=0.1');
          
          // Step 5: ARP Reply
          timeline.to('.step-box-5', { opacity: 1, scale: 1, duration: 0.4 }, '+=0.8');
          timeline.to('.arp-reply-packet', { 
            opacity: 1,
            motionPath: {
              path: '#path-reply',
              align: '#path-reply',
              autoRotate: -90,
              start: 0,
              end: 1,
            },
            duration: 1.5,
            ease: 'power1.inOut'
          }, '-=0.1');
          timeline.to('.arp-fields-reply', { opacity: 1, y: 0, duration: 0.3 }, '-=0.5');
          
          // Step 6: Cache updated
          timeline.to('.step-box-6', { opacity: 1, scale: 1, duration: 0.4 }, '+=1');
          timeline.to('.cache-entry-new', { opacity: 1, x: 0, duration: 0.3, ease: 'back.out(1.5)' }, '-=0.1');
          timeline.to('.frame-sent', { opacity: 1, duration: 0.3 }, '-=0.1');
          
        } else {
          // Remote scenario
          
          timeline.to('.step-box-r1', { opacity: 1, scale: 1, duration: 0.4 }, '+=0.5');
          timeline.to('.step-box-r2', { opacity: 1, scale: 1, duration: 0.4 }, '+=0.8');
          timeline.to('.step-box-r3', { opacity: 1, scale: 1, duration: 0.4 }, '+=0.8');
          timeline.to('.arp-request-packet-r', { 
            opacity: 1,
            motionPath: {
              path: '#path-broadcast-r',
              align: '#path-broadcast-r',
              autoRotate: 90,
              start: 0,
              end: 1,
            },
            duration: 1.5,
          }, '-=0.1');
          timeline.to('.step-box-r4', { opacity: 1, scale: 1, duration: 0.4 }, '+=1');
          timeline.to('.arp-reply-packet-r', { 
            opacity: 1,
            motionPath: {
              path: '#path-reply-r',
              align: '#path-reply-r',
              autoRotate: -90,
              start: 0,
              end: 1,
            },
            duration: 1.5,
          }, '-=0.1');
          timeline.to('.step-box-r5', { opacity: 1, scale: 1, duration: 0.4 }, '+=1');
          timeline.to('.frame-sent-r', { opacity: 1, duration: 0.3 }, '-=0.1');
        }
      }
    }, svgRef.current);
    
    return () => ctx.revert();
  }, [animationState.isPlaying, animationState.speed, mode, onAnimationComplete]);
  
  useEffect(() => {
    if (animationRef.current) {
      animationRef.current.timeScale(animationState.speed);
      if (animationState.isPlaying) {
        animationRef.current.play();
      } else {
        animationRef.current.pause();
      }
    }
  }, [animationState.isPlaying, animationState.speed]);
  
  const width = 1000;
  const height = 550;
  
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[1000px]">
        {/* Mode Toggle */}
        <div className="flex justify-center gap-3 mb-4">
          <button
            onClick={() => setMode('local')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'local' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {language === 'bn' ? 'লোকাল নেটওয়ার্ক (ARP)' : 'Local Network (ARP)'}
          </button>
          <button
            onClick={() => setMode('remote')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'remote' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {language === 'bn' ? 'রিমোট নেটওয়ার্ক (গেটওয়ে ARP)' : 'Remote Network (Gateway ARP)'}
          </button>
        </div>
        
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto"
          role="img"
          aria-label={t('chapter7')}
        >
          <defs>
            <filter id="deviceShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#0f172a" floodOpacity="0.1" />
            </filter>
            <marker id="arrowRight" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <path d="M0,0 L0,8 L8,4 Z" fill="#64748b" />
            </marker>
            <marker id="arrowLeft" markerWidth="8" markerHeight="8" refX="2" refY="4" orient="auto">
              <path d="M8,0 L8,8 L0,4 Z" fill="#64748b" />
            </marker>
            <marker id="packetArrow" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
              <ellipse cx="5" cy="5" rx="4" ry="2.5" fill="#2563eb" />
            </marker>
            
            {/* Broadcast path - goes to all hosts */}
            <path id="path-broadcast" d="M 230 220 Q 350 100 490 220" fill="none" />
            <path id="path-reply" d="M 490 220 Q 350 300 230 220" fill="none" />
            
            {/* Remote paths */}
            <path id="path-broadcast-r" d="M 230 220 Q 490 100 680 220" fill="none" />
            <path id="path-reply-r" d="M 680 220 Q 490 300 230 220" fill="none" />
          </defs>
          
          {/* Title */}
          <text x={width / 2} y={20} textAnchor="middle" fontSize="16" fontWeight="700" fill="#0f172a">
            {mode === 'local' 
              ? (language === 'bn' ? 'ARP — লোকাল নেটওয়ার্কে MAC খুঁজে বের করা' : 'ARP — Finding MAC on Local Network')
              : (language === 'bn' ? 'ARP — ডিফল্ট গেটওয়ের জন্য MAC খুঁজে বের করা' : 'ARP — Finding Gateway MAC for Remote')
            }
          </text>
          
          {/* Network */}
          <g>
            {/* Switch */}
            <g className="switch" transform="translate(370, 180)" filter="url(#deviceShadow)">
              <rect x={-40} y={0} width={80} height={60} rx={8} fill="#fef3c7" stroke="#f59e0b" strokeWidth={2} />
              <g stroke="#2563eb" strokeWidth={2} strokeLinecap="round">
                <line x1={0} y1={12} x2={50} y2={12} />
                <line x1={0} y1={30} x2={50} y2={30} stroke="#22c55e" />
                <line x1={0} y1={48} x2={50} y2={48} />
              </g>
              <circle cx={25} cy={30} r={4} fill="#22c55e" />
              <text x={0} y={75} textAnchor="middle" fontSize="11" fontWeight="600" fill="#0f172a">Switch</text>
            </g>
            
            {/* Connections */}
            <g stroke="#cbd5e1" strokeWidth="3" fill="none" strokeDasharray="8 4">
              <line x1={230} y1={230} x2={330} y2={230} />
              <line x1={450} y1={230} x2={630} y2={230} />
            </g>
            
            {hosts.map((host) => (
              <g 
                key={host.id} 
                className={`host host-${host.id}`}
                transform={`translate(${host.x}, ${host.y})`}
                filter="url(#deviceShadow)"
              >
                <rect x={-40} y={-40} width={80} height={80} rx={12} fill="#dbeafe" stroke="#2563eb" strokeWidth={2} className={`host-${host.id}-highlight`} />
                <rect x={-25} y={-25} width={50} height={30} rx={3} fill="#1e293b" stroke="#334155" />
                <rect x={-25} y={10} width={50} height={15} rx={3} fill="#334155" opacity="0.5" />
                <text x={0} y={55} textAnchor="middle" fontSize="12" fontWeight="600" fill="#0f172a">{host.name}</text>
                <text x={0} y={70} textAnchor="middle" fontSize="8" fill="#64748b" fontFamily="monospace">{host.mac}</text>
                <text x={0} y={82} textAnchor="middle" fontSize="8" fill="#64748b" fontFamily="monospace">{host.ip}</text>
              </g>
            ))}
          </g>
          
          {/* ARP Packets */}
          {mode === 'local' && (
            <>
              {/* ARP Request Packet (Broadcast) */}
              <g className="arp-packet arp-request-packet" transform="translate(-30, -15)" opacity={0}>
                <ellipse cx="0" cy="0" rx="25" ry="15" fill="#2563eb" stroke="#1d4ed8" strokeWidth={2} filter="url(#deviceShadow)" markerEnd="url(#packetArrow)" />
                <text x="0" y="4" textAnchor="middle" fontSize="9" fontWeight="700" fill="white">ARP REQ</text>
                <text x="0" y={-25} textAnchor="middle" fontSize="8" fill="#2563eb">Broadcast FF:FF:FF:FF:FF:FF</text>
              </g>
              
              {/* ARP Reply Packet (Unicast) */}
              <g className="arp-packet arp-reply-packet" transform="translate(-30, -15)" opacity={0}>
                <ellipse cx="0" cy="0" rx="25" ry="15" fill="#22c55e" stroke="#16a34a" strokeWidth={2} filter="url(#deviceShadow)" markerEnd="url(#packetArrow)" />
                <text x="0" y="4" textAnchor="middle" fontSize="9" fontWeight="700" fill="white">ARP REPLY</text>
                <text x="0" y={-25} textAnchor="middle" fontSize="8" fill="#22c55e">Unicast to Host A</text>
              </g>
            </>
          )}
          
          {mode === 'remote' && (
            <>
              <g className="arp-packet arp-request-packet-r" transform="translate(-30, -15)" opacity={0}>
                <ellipse cx="0" cy="0" rx="25" ry="15" fill="#f59e0b" stroke="#d97706" strokeWidth={2} filter="url(#deviceShadow)" markerEnd="url(#packetArrow)" />
                <text x="0" y="4" textAnchor="middle" fontSize="9" fontWeight="700" fill="white">ARP REQ</text>
                <text x="0" y={-25} textAnchor="middle" fontSize="8" fill="#f59e0b">Broadcast for Gateway</text>
              </g>
              
              <g className="arp-packet arp-reply-packet-r" transform="translate(-30, -15)" opacity={0}>
                <ellipse cx="0" cy="0" rx="25" ry="15" fill="#ec4899" stroke="#db2777" strokeWidth={2} filter="url(#deviceShadow)" markerEnd="url(#packetArrow)" />
                <text x="0" y="4" textAnchor="middle" fontSize="9" fontWeight="700" fill="white">ARP REPLY</text>
                <text x="0" y={-25} textAnchor="middle" fontSize="8" fill="#ec4899">Unicast from Router</text>
              </g>
            </>
          )}
          
          {/* Step boxes - Local */}
          {mode === 'local' && arpSteps.map((step, i) => (
            <g key={step.step} className={`step-box step-box-${step.step}`} transform={`translate(${20 + (i % 3) * 320}, ${i < 3 ? 350 : 450})`} opacity={0}>
              <rect x={0} y={0} width={300} height={90} rx={8} fill="white" stroke="#e2e8f0" strokeWidth={1} filter="url(#deviceShadow)" />
              <circle cx={15} cy={15} r={12} fill="#2563eb" />
              <text x={15} y={19} textAnchor="middle" fontSize="10" fontWeight="700" fill="white">{step.step}</text>
              <text x={35} y={18} fontSize="10" fontWeight="600" fill="#0f172a">{step.title}</text>
              <text x={35} y={36} fontSize="9" fill="#64748b">{step.description}</text>
            </g>
          ))}
          
          {/* Step boxes - Remote */}
          {mode === 'remote' && remoteSteps.map((step, i) => (
            <g key={step.step} className={`step-box step-box-r${step.step}`} transform={`translate(${20 + (i % 3) * 320}, ${i < 3 ? 350 : 450})`} opacity={0}>
              <rect x={0} y={0} width={300} height={90} rx={8} fill="white" stroke="#e2e8f0" strokeWidth={1} filter="url(#deviceShadow)" />
              <circle cx={15} cy={15} r={12} fill="#f59e0b" />
              <text x={15} y={19} textAnchor="middle" fontSize="10" fontWeight="700" fill="white">{step.step}</text>
              <text x={35} y={18} fontSize="10" fontWeight="600" fill="#0f172a">{step.title}</text>
              <text x={35} y={36} fontSize="9" fill="#64748b">{step.description}</text>
            </g>
          ))}
          
          {/* ARP Cache (Host A) */}
          <g transform="translate(20, 350)">
            <rect x={0} y={0} width={250} height={180} rx={8} fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />
            <text x={15} y={22} fontSize="11" fontWeight="600" fill="#0f172a">
              {language === 'bn' ? 'হোস্ট A-এর ARP ক্যাশে' : 'Host A ARP Cache'}
            </text>
            <text x={15} y={38} fontSize="9" fill="#64748b">Before ARP:</text>
            
            <g className="cache-entry" transform="translate(15, 45)" opacity={0} x={-20}>
              <rect x={0} y={0} width={220} height={22} rx={3} fill="#fef2f2" stroke="#ef4444" strokeWidth={1} strokeDasharray="4 2" />
              <text x={5} y={15} fontSize="9" fontFamily="monospace" fill="#ef4444" className="cache-miss" opacity={0}>
                (empty - no entry for 192.168.1.20)
              </text>
            </g>
            
            <g className="cache-entry cache-entry-new" transform="translate(15, 75)" opacity={0} x={-20}>
              <rect x={0} y={0} width={220} height={45} rx={3} fill="#f0fdf4" stroke="#22c55e" strokeWidth={1} />
              <text x={5} y={15} fontSize="9" fontFamily="monospace" fill="#166534">192.168.1.20 → 00:1A:2B:3C:4D:5F</text>
              <text x={5} y={33} fontSize="8" fill="#166534">Type: Dynamic | Timeout: ~5 min</text>
            </g>
            
            <text x={15} y={135} fontSize="9" fill="#64748b" className="frame-sent" opacity={0}>
              ✓ Frame sent: Dst MAC = 00:1A:2B:3C:4D:5F
            </text>
          </g>
          
          {/* ARP Packet Fields */}
          <g className="arp-fields arp-fields-request" transform="translate(530, 350)" opacity={0} y={10}>
            <rect x={0} y={0} width={450} height={180} rx={8} fill="#dbeafe" stroke="#2563eb" strokeWidth={1} />
            <text x={15} y={22} fontSize="11" fontWeight="600" fill="#1d4ed8">
              {language === 'bn' ? 'ARP অনুরোধ প্যাকেট (Broadcast)' : 'ARP Request Packet (Broadcast)'}
            </text>
            <g transform="translate(15, 30)" fontSize="9" fontFamily="monospace">
              <text x={0} y={0} fill="#1d4ed8">Hardware Type: 1 (Ethernet)</text>
              <text x={0} y={18} fill="#1d4ed8">Protocol Type: 0x0800 (IPv4)</text>
              <text x={0} y={36} fill="#1d4ed8">Hardware Size: 6 | Protocol Size: 4</text>
              <text x={0} y={54} fill="#1d4ed8" fontWeight="600">Operation: 1 (REQUEST)</text>
              <text x={0} y={72} fill="#334155">Sender MAC: 00:1A:2B:3C:4D:5E</text>
              <text x={0} y={90} fill="#334155">Sender IP: 192.168.1.10</text>
              <text x={0} y={108} fill="#ef4444" fontWeight="600">Target MAC: 00:00:00:00:00:00 (unknown)</text>
              <text x={0} y={126} fill="#ef4444" fontWeight="600">Target IP: 192.168.1.20 (looking for this)</text>
            </g>
          </g>
          
          <g className="arp-fields arp-fields-reply" transform="translate(530, 350)" opacity={0} y={10}>
            <rect x={0} y={0} width={450} height={180} rx={8} fill="#dcfce7" stroke="#22c55e" strokeWidth={1} />
            <text x={15} y={22} fontSize="11" fontWeight="600" fill="#166534">
              {language === 'bn' ? 'ARP প্রতিক্রিয়া প্যাকেট (Unicast)' : 'ARP Reply Packet (Unicast)'}
            </text>
            <g transform="translate(15, 30)" fontSize="9" fontFamily="monospace">
              <text x={0} y={0} fill="#166534">Hardware Type: 1 (Ethernet)</text>
              <text x={0} y={18} fill="#166534">Protocol Type: 0x0800 (IPv4)</text>
              <text x={0} y={36} fill="#166534">Hardware Size: 6 | Protocol Size: 4</text>
              <text x={0} y={54} fill="#166534" fontWeight="600">Operation: 2 (REPLY)</text>
              <text x={0} y={72} fill="#334155">Sender MAC: 00:1A:2B:3C:4D:5F ← Host B's MAC!</text>
              <text x={0} y={90} fill="#334155">Sender IP: 192.168.1.20</text>
              <text x={0} y={108} fill="#2563eb" fontWeight="600">Target MAC: 00:1A:2B:3C:4D:5E (Host A)</text>
              <text x={0} y={126} fill="#2563eb" fontWeight="600">Target IP: 192.168.1.10</text>
            </g>
          </g>
          
          {/* IPv6 Note */}
          <g transform="translate(20, 530)">
            <rect x={0} y={0} width={width - 40} height={30} rx={6} fill="#fffbeb" stroke="#f59e0b" strokeWidth={1} />
            <text x={15} y={18} fontSize="9" fill="#92400e">
              {language === 'bn' ? 'দ্রষ্টব্য: IPv6 ARP ব্যবহার করে না — এটি Neighbor Discovery Protocol (NDP) ব্যবহার করে (ICMPv6 টাইপ ১৩৫/১৩৬)' : 'Note: IPv6 does not use ARP — it uses Neighbor Discovery Protocol (NDP) with ICMPv6 types 135/136'}
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
});

interface Chapter7Props extends DiagramProps {}
export default Chapter7;
