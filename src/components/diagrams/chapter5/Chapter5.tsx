import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { DiagramProps } from '../../../types';

interface EthernetDevice {
  id: string;
  name: string;
  mac: string;
  ip: string;
  x: number;
  y: number;
  type: 'host' | 'switch' | 'router' | 'server';
}

const devices: EthernetDevice[] = [
  { id: 'hostA', name: 'Host A', mac: '00:1A:2B:3C:4D:5E', ip: '192.168.1.10', x: 100, y: 150, type: 'host' },
  { id: 'hostB', name: 'Host B', mac: '00:1A:2B:3C:4D:5F', ip: '192.168.1.20', x: 100, y: 350, type: 'host' },
  { id: 'switch', name: 'Switch', mac: 'N/A', ip: 'N/A', x: 400, y: 250, type: 'switch' },
  { id: 'router', name: 'Router', mac: '00:1A:2B:3C:4D:60', ip: '192.168.1.1', x: 700, y: 250, type: 'router' },
  { id: 'server', name: 'Server', mac: '00:1A:2B:3C:4D:61', ip: '203.0.113.10', x: 900, y: 250, type: 'server' },
];

const macTable = [
  { port: 1, mac: '00:1A:2B:3C:4D:5E', device: 'Host A' },
  { port: 2, mac: '00:1A:2B:3C:4D:5F', device: 'Host B' },
  { port: 3, mac: '00:1A:2B:3C:4D:60', device: 'Router' },
];

export const Chapter5 = React.memo(function Chapter5({ 
  language, 
  animationState, 
  onAnimationComplete 
}: Chapter5Props) {
  const { t } = useTranslation();
  const svgRef = useRef<SVGSVGElement>(null);
  const animationRef = useRef<gsap.core.Timeline | null>(null);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({
        onComplete: () => {
          onAnimationComplete?.();
        },
        onUpdate: () => {
          // const progress = Math.round(timeline.progress() * 10);
        },
      });
      
      animationRef.current = timeline;
      
      // Handle initial state based on playing status
      if (animationState.isPlaying) {
        // Animation will play - set initial hidden state
        gsap.set('.device', { opacity: 0, scale: 0.8 });
        gsap.set('.connection', { strokeDashoffset: 200 });
        gsap.set('.packet', { opacity: 0 });
        gsap.set('.mac-table-row', { opacity: 0, x: -20 });
        gsap.set('.frame-detail', { opacity: 0, scale: 0.9 });
        gsap.set('.step-label', { opacity: 0 });
        gsap.set('.mac-learning', { opacity: 0 });
      } else {
        // Not playing - show everything immediately
        gsap.set('.device', { opacity: 1, scale: 1 });
        gsap.set('.connection', { strokeDashoffset: 0 });
        gsap.set('.packet', { opacity: 1 });
        gsap.set('.mac-table-row', { opacity: 1, x: 0 });
        gsap.set('.frame-detail', { opacity: 1, scale: 1 });
        gsap.set('.step-label', { opacity: 1 });
        gsap.set('.mac-learning', { opacity: 1 });
      }
      
      if (animationState.isPlaying) {
        // Initial setup
        gsap.set('.device', { opacity: 0, scale: 0.8 });
        gsap.set('.connection', { strokeDashoffset: 200 });
        gsap.set('.packet', { opacity: 0 });
        gsap.set('.mac-table-row', { opacity: 0, x: -20 });
        gsap.set('.frame-detail', { opacity: 0, scale: 0.9 });
        gsap.set('.step-label', { opacity: 0 });
        gsap.set('.mac-learning', { opacity: 0 });
        
        // Devices appear
        timeline.to('.device', { 
          opacity: 1, 
          scale: 1, 
          duration: 0.5, 
          stagger: 0.1,
          ease: 'back.out(1.5)'
        });
        
        // Connections
        timeline.to('.connection', { 
          strokeDashoffset: 0, 
          duration: 0.8, 
          stagger: 0.1,
          ease: 'power2.out'
        }, '-=0.2');
        
        // MAC table builds
        timeline.to('.mac-table-row', { 
          opacity: 1, 
          x: 0, 
          duration: 0.3, 
          stagger: 0.15
        }, '-=0.3');
        
        // Step 1: Host A sends frame to Host B
        timeline.to('.step-label-1', { opacity: 1, duration: 0.3 }, '+=0.5');
        timeline.to('.packet-1', { 
          opacity: 1,
          motionPath: {
            path: '#path-hostA-switch',
            align: '#path-hostA-switch',
            autoRotate: 90,
            start: 0,
            end: 1,
          },
          duration: 1.5,
          ease: 'power1.inOut'
        }, '-=0.1');
        timeline.to('.step-label-1', { opacity: 0.5, duration: 0.2 }, '+=0.5');
        
        // Switch learns MAC
        timeline.to('.mac-learning', { opacity: 1, duration: 0.3 });
        timeline.to('.mac-table-row-1', { strokeWidth: 3, stroke: '#22c55e', duration: 0.3 });
        timeline.to('.mac-learning', { opacity: 0.5, duration: 0.2 }, '+=0.5');
        
        // Step 2: Switch forwards to Host B
        timeline.to('.step-label-2', { opacity: 1, duration: 0.3 });
        timeline.to('.packet-1', { 
          motionPath: {
            path: '#path-switch-hostB',
            align: '#path-switch-hostB',
            autoRotate: 90,
            start: 0,
            end: 1,
          },
          duration: 1.5,
          ease: 'power1.inOut'
        }, '-=0.1');
        timeline.to('.step-label-2', { opacity: 0.5, duration: 0.2 }, '+=0.5');
        
        // Step 3: Host A sends to Server (via Router)
        timeline.to('.step-label-3', { opacity: 1, duration: 0.3 }, '+=0.5');
        timeline.to('.packet-2', { 
          opacity: 1,
          motionPath: {
            path: '#path-hostA-switch',
            align: '#path-hostA-switch',
            autoRotate: 90,
            start: 0,
            end: 1,
          },
          duration: 1.5,
          ease: 'power1.inOut'
        }, '-=0.1');
        timeline.to('.step-label-3', { opacity: 0.5, duration: 0.2 }, '+=0.5');
        
        // Switch forwards to Router
        timeline.to('.step-label-4', { opacity: 1, duration: 0.3 });
        timeline.to('.packet-2', { 
          motionPath: {
            path: '#path-switch-router',
            align: '#path-switch-router',
            autoRotate: 90,
            start: 0,
            end: 1,
          },
          duration: 1.5,
          ease: 'power1.inOut'
        }, '-=0.1');
        timeline.to('.step-label-4', { opacity: 0.5, duration: 0.2 }, '+=0.5');
        
        // Router to Internet/Server
        timeline.to('.step-label-5', { opacity: 1, duration: 0.3 }, '+=0.5');
        timeline.to('.packet-2', { 
          motionPath: {
            path: '#path-router-server',
            align: '#path-router-server',
            autoRotate: 90,
            start: 0,
            end: 1,
          },
          duration: 2,
          ease: 'power1.inOut'
        }, '-=0.1');
        
        // Show frame detail at end
        timeline.to('.frame-detail', { opacity: 1, scale: 1, duration: 0.5 }, '+=0.5');
      }
    }, svgRef.current);
    
    return () => ctx.revert();
  }, [animationState.isPlaying, animationState.speed, onAnimationComplete]);
  
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
  
  const width = 1050;
  const height = 500;
  
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[1050px]">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto"
          role="img"
          aria-label={t('chapter5')}
        >
          <defs>
            <filter id="deviceShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#0f172a" floodOpacity="0.1" />
            </filter>
            <linearGradient id="hostGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#dbeafe" />
              <stop offset="100%" stopColor="#bfdbfe" />
            </linearGradient>
            <linearGradient id="switchGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fef3c7" />
              <stop offset="100%" stopColor="#fde68a" />
            </linearGradient>
            <linearGradient id="routerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fce7f3" />
              <stop offset="100%" stopColor="#fbcfe8" />
            </linearGradient>
            <linearGradient id="serverGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#dcfce7" />
              <stop offset="100%" stopColor="#bbf7d0" />
            </linearGradient>
            
            {/* Paths for packet animation */}
            <path id="path-hostA-switch" d="M 180 180 Q 290 180 360 250" fill="none" />
            <path id="path-switch-hostB" d="M 440 250 Q 330 320 180 380" fill="none" />
            <path id="path-switch-router" d="M 440 250 Q 550 250 660 250" fill="none" />
            <path id="path-router-server" d="M 760 250 Q 830 250 880 250" fill="none" />
            
            <marker id="packetMarker" markerWidth="12" markerHeight="12" refX="6" refY="6" orient="auto">
              <ellipse cx="6" cy="6" rx="5" ry="3" fill="#2563eb" />
            </marker>
          </defs>
          
          {/* Title */}
          <text x={width / 2} y={25} textAnchor="middle" fontSize="18" fontWeight="700" fill="#0f172a">
            {language === 'bn' ? 'ইথারনেট প্রোটোকল — লোকাল নেটওয়ার্ক যোগাযোগ' : 'Ethernet Protocol — Local Network Communication'}
          </text>
          
          {/* LAN boundary */}
          <rect x={40} y={50} width={680} height={260} rx={12} fill="#fef3c7" opacity="0.3" stroke="#f59e0b" strokeWidth={2} strokeDasharray="8 4" />
          <text x={60} y={65} fontSize="10" fontWeight="600" fill="#f59e0b">
            {language === 'bn' ? 'লোকাল এরিয়া নেটওয়ার্ক (LAN) — 192.168.1.0/24' : 'Local Area Network (LAN) — 192.168.1.0/24'}
          </text>
          
          {/* Connections */}
          <g className="connections" stroke="#cbd5e1" strokeWidth="3" fill="none" strokeDasharray="200" strokeDashoffset="200">
            <path className="connection" d="M 180 180 Q 290 180 360 250" />
            <path className="connection" d="M 180 380 Q 290 320 360 250" />
            <path className="connection" d="M 440 250 Q 550 250 660 250" />
            <path className="connection" d="M 760 250 L 880 250" stroke="#94a3b8" strokeWidth="2" strokeDasharray="8 4" />
          </g>
          
          {/* Devices */}
          {devices.map((device) => (
            <g 
              key={device.id}
              className="device"
              transform={`translate(${device.x}, ${device.y})`}
              filter="url(#deviceShadow)"
            >
              {device.type === 'host' && (
                <>
                  <rect x={0} y={0} width={80} height={80} rx={12} fill="url(#hostGradient)" stroke="#2563eb" strokeWidth={2} />
                  <rect x={15} y={15} width={50} height={30} rx={3} fill="#1e293b" stroke="#334155" />
                  <rect x={15} y={50} width={50} height={15} rx={3} fill="#334155" opacity="0.5" />
                </>
              )}
              {device.type === 'switch' && (
                <>
                  <rect x={-30} y={0} width={80} height={80} rx={12} fill="url(#switchGradient)" stroke="#f59e0b" strokeWidth={2} />
                  <g stroke="#2563eb" strokeWidth={2} strokeLinecap="round">
                    <line x1={0} y1={20} x2={50} y2={20} />
                    <line x1={0} y1={40} x2={50} y2={40} stroke="#22c55e" />
                    <line x1={0} y1={60} x2={50} y2={60} />
                  </g>
                  <circle cx={25} cy={40} r={4} fill="#22c55e" />
                </>
              )}
              {device.type === 'router' && (
                <>
                  <polygon points="25,0 55,15 55,65 25,80 -5,65 -5,15" fill="url(#routerGradient)" stroke="#ec4899" strokeWidth={2} />
                  <circle cx={25} cy={40} r={15} fill="#fdf2f8" stroke="#ec4899" strokeWidth={1.5} />
                  <path d="M25 25 L25 40 L35 45" stroke="#ec4899" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </>
              )}
              {device.type === 'server' && (
                <>
                  <rect x={0} y={0} width={100} height={80} rx={12} fill="url(#serverGradient)" stroke="#22c55e" strokeWidth={2} />
                  <rect x={15} y={15} width={70} height={25} rx={3} fill="#1e293b" stroke="#334155" />
                  <rect x={10} y={50} width={35} height={20} rx={3} fill="#1e293b" stroke="#334155" />
                  <rect x={55} y={50} width={35} height={20} rx={3} fill="#1e293b" stroke="#334155" />
                </>
              )}
              
              {/* Device labels */}
              <text x={device.type === 'server' ? 50 : 40} y={95} textAnchor="middle" fontSize="12" fontWeight="600" fill="#0f172a">
                {device.name}
              </text>
              <text x={device.type === 'server' ? 50 : 40} y={110} textAnchor="middle" fontSize="9" fill="#64748b" fontFamily="monospace">
                {device.mac}
              </text>
              <text x={device.type === 'server' ? 50 : 40} y={122} textAnchor="middle" fontSize="9" fill="#64748b" fontFamily="monospace">
                {device.ip}
              </text>
            </g>
          ))}
          
          {/* Packets */}
          {/* Packet 1: Host A -> Host B */}
          <g className="packet packet-1" transform="translate(-15, -10)" opacity={0}>
            <ellipse cx="0" cy="0" rx="12" ry="8" fill="#2563eb" stroke="#1d4ed8" strokeWidth={1.5} filter="url(#deviceShadow)" />
            <text x="0" y="3" textAnchor="middle" fontSize="7" fontWeight="700" fill="white">A→B</text>
          </g>
          
          {/* Packet 2: Host A -> Server */}
          <g className="packet packet-2" transform="translate(-15, -10)" opacity={0}>
            <ellipse cx="0" cy="0" rx="12" ry="8" fill="#f59e0b" stroke="#d97706" strokeWidth={1.5} filter="url(#deviceShadow)" />
            <text x="0" y="3" textAnchor="middle" fontSize="7" fontWeight="700" fill="white">A→Srv</text>
          </g>
          
          {/* Step labels */}
          <text x={200} y={60} className="step-label step-label-1" textAnchor="middle" fontSize="10" fontWeight="500" fill="#2563eb" opacity={0}>
            ① {language === 'bn' ? 'হোস্ট A হোস্ট B-কে ফ্রেম পাঠায়' : 'Host A sends frame to Host B'}
          </text>
          <text x={200} y={420} className="step-label step-label-2" textAnchor="middle" fontSize="10" fontWeight="500" fill="#22c55e" opacity={0}>
            ② {language === 'bn' ? 'স্যুইচ MAC টেবিল অনুযায়ী ফরওয়ার্ড করে' : 'Switch forwards via MAC table'}
          </text>
          <text x={550} y={60} className="step-label step-label-3" textAnchor="middle" fontSize="10" fontWeight="500" fill="#f59e0b" opacity={0}>
            ③ {language === 'bn' ? 'হোস্ট A সার্ভারকে পাঠায় (রাউটার przez)' : 'Host A sends to Server (via Router)'}
          </text>
          <text x={550} y={160} className="step-label step-label-4" textAnchor="middle" fontSize="10" fontWeight="500" fill="#ec4899" opacity={0}>
            ④ {language === 'bn' ? 'স্যুইচ রাউটারের MAC জানে, ফরওয়ার্ড করে' : 'Switch knows Router MAC, forwards'}
          </text>
          <text x={800} y={60} className="step-label step-label-5" textAnchor="middle" fontSize="10" fontWeight="500" fill="#22c55e" opacity={0}>
            ⑤ {language === 'bn' ? 'রাউটার ইন্টারনেটের মাধ্যমে সার্ভারকে পাঠায়' : 'Router routes to Server via Internet'}
          </text>
          
          {/* MAC Learning annotation */}
          <g className="mac-learning" opacity={0} transform="translate(370, 350)">
            <rect x={0} y={0} width={200} height={50} rx={8} fill="#dcfce7" stroke="#22c55e" strokeWidth={2} />
            <text x={100} y={18} textAnchor="middle" fontSize="10" fontWeight="600" fill="#166534">
              {language === 'bn' ? 'স্যুইচ শিখে: Host A = Port 1' : 'Switch learns: Host A = Port 1'}
            </text>
            <text x={100} y={35} textAnchor="middle" fontSize="9" fill="#166534">
              {language === 'bn' ? 'সোর্স MAC রিকর্ড করে' : 'Records source MAC'}
            </text>
          </g>
          
          {/* MAC Address Table */}
          <g transform="translate(720, 350)">
            <rect x={0} y={0} width={280} height={120} rx={8} fill="white" stroke="#e2e8f0" strokeWidth={1} filter="url(#deviceShadow)" />
            <text x={140} y={25} textAnchor="middle" fontSize="12" fontWeight="600" fill="#0f172a">
              {language === 'bn' ? 'MAC ঠিকানা টেবিল' : 'MAC Address Table'}
            </text>
            <text x={140} y={42} textAnchor="middle" fontSize="9" fill="#64748b">
              {language === 'bn' ? 'স্যুইচের অভ্যন্তরীণ টেবিল' : 'Switch Internal Table'}
            </text>
            
            {macTable.map((entry, i) => (
              <g key={entry.port} className={`mac-table-row mac-table-row-${entry.port}`} transform={`translate(20, ${55 + i * 22})`} opacity={0}>
                <text x={0} y={0} fontSize="10" fontWeight="500" fill="#334155">Port {entry.port}</text>
                <text x={70} y={0} fontSize="9" fontFamily="monospace" fill="#2563eb">{entry.mac}</text>
                <text x={210} y={0} fontSize="9" fill="#64748b">{entry.device}</text>
              </g>
            ))}
          </g>
          
          {/* Ethernet Frame Detail */}
          <g className="frame-detail" transform="translate(40, 330)" opacity={0} filter="url(#deviceShadow)">
            <rect x={0} y={0} width={width - 80} height={150} rx={12} fill="white" stroke="#e2e8f0" strokeWidth={1} />
            <text x={20} y={25} fontSize="13" fontWeight="600" fill="#0f172a">
              {language === 'bn' ? 'ইথারনেট ফ্রেম গঠন (Ethernet II Frame)' : 'Ethernet Frame Structure (Ethernet II)'}
            </text>
            
            <g transform="translate(20, 40)">
              {/* Frame fields visualization */}
              <g transform="translate(0, 0)">
                <rect x={0} y={0} width={140} height={30} rx={3} fill="#2563eb" opacity={0.2} stroke="#2563eb" strokeWidth={2} />
                <text x={70} y={18} textAnchor="middle" fontSize="10" fontWeight="600" fill="#2563eb">Dst MAC (48 bits)</text>
              </g>
              <g transform="translate(150, 0)">
                <rect x={0} y={0} width={140} height={30} rx={3} fill="#2563eb" opacity={0.2} stroke="#2563eb" strokeWidth={2} />
                <text x={70} y={18} textAnchor="middle" fontSize="10" fontWeight="600" fill="#2563eb">Src MAC (48 bits)</text>
              </g>
              <g transform="translate(300, 0)">
                <rect x={0} y={0} width={100} height={30} rx={3} fill="#f59e0b" opacity={0.2} stroke="#f59e0b" strokeWidth={2} />
                <text x={50} y={18} textAnchor="middle" fontSize="10" fontWeight="600" fill="#f59e0b">EtherType (16 bits)</text>
              </g>
              <g transform="translate(410, 0)">
                <rect x={0} y={0} width={200} height={30} rx={3} fill="#166534" opacity={0.15} stroke="#166534" strokeWidth={1} strokeDasharray="4 2" />
                <text x={100} y={18} textAnchor="middle" fontSize="10" fontWeight="500" fill="#166534">Payload (46-1500 bytes) — IP Packet</text>
              </g>
              <g transform="translate(620, 0)">
                <rect x={0} y={0} width={100} height={30} rx={3} fill="#ef4444" opacity={0.2} stroke="#ef4444" strokeWidth={2} />
                <text x={50} y={18} textAnchor="middle" fontSize="10" fontWeight="600" fill="#ef4444">FCS (32 bits)</text>
              </g>
            </g>
            
            <g transform="translate(20, 90)">
              <text x={0} y={0} fontSize="9" fontWeight="600" fill="#64748b">
                {language === 'bn' ? 'EtherType মান:' : 'EtherType Values:'}
              </text>
              <text x={0} y={18} fontSize="9" fontFamily="monospace" fill="#334155">
                0x0800 = IPv4  |  0x86DD = IPv6  |  0x0806 = ARP  |  0x888E = EAPOL (802.1X)
              </text>
              <text x={0} y={36} fontSize="9" fontWeight="600" fill="#64748b">
                {language === 'bn' ? 'FCS (Frame Check Sequence): CRC32 এরর ডিটেকশন — পায়লে করপ্ট হলে ড্রপ হয়' : 'FCS (Frame Check Sequence): CRC32 error detection — frame dropped if corrupted'}
              </text>
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
});

interface Chapter5Props extends DiagramProps {}
export default Chapter5;
