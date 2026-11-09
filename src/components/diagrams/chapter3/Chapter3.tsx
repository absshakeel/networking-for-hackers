import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { DiagramProps } from '../../../types';

interface TCPIPLayer {
  number: number;
  name: string;
  osiMapping: number[];
  protocols: string[];
  responsibility: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}

const tcpipLayers: TCPIPLayer[] = [
  {
    number: 4,
    name: 'Application',
    osiMapping: [7, 6, 5],
    protocols: ['HTTP/HTTPS', 'DNS', 'SMTP', 'SSH', 'FTP', 'DHCP', 'SNMP', 'TFTP'],
    responsibility: 'User applications and network services',
    color: '#0f172a',
    bgColor: '#f8fafc',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 16l4-16M6 16c0-1.1.9-2 2-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4z" /></svg>
  },
  {
    number: 3,
    name: 'Transport',
    osiMapping: [4],
    protocols: ['TCP', 'UDP', 'SCTP', 'DCCP'],
    responsibility: 'End-to-end communication, reliability, flow control',
    color: '#166534',
    bgColor: '#dcfce7',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
  },
  {
    number: 2,
    name: 'Internet',
    osiMapping: [3],
    protocols: ['IPv4', 'IPv6', 'ICMP', 'ICMPv6', 'IPsec', 'IGMP'],
    responsibility: 'Logical addressing, routing, packet forwarding',
    color: '#78350f',
    bgColor: '#fef3c7',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
  },
  {
    number: 1,
    name: 'Network Access / Link',
    osiMapping: [2, 1],
    protocols: ['Ethernet (802.3)', 'Wi-Fi (802.11)', 'PPP', 'ARP', 'NDP', 'MAC'],
    responsibility: 'Physical transmission, framing, media access',
    color: '#374151',
    bgColor: '#e5e7eb',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" /></svg>
  },
];

const osiLayers = [
  { number: 7, name: 'Application', color: '#0f172a' },
  { number: 6, name: 'Presentation', color: '#1e3a8a' },
  { number: 5, name: 'Session', color: '#1e40af' },
  { number: 4, name: 'Transport', color: '#166534' },
  { number: 3, name: 'Network', color: '#78350f' },
  { number: 2, name: 'Data Link', color: '#7c2d12' },
  { number: 1, name: 'Physical', color: '#374151' },
];

export const Chapter3 = React.memo(function Chapter3({ 
  language, 
  animationState, 
  onAnimationComplete 
}: Chapter3Props) {
  const { t } = useTranslation();
  const svgRef = useRef<SVGSVGElement>(null);
  const animationRef = useRef<gsap.core.Timeline | null>(null);
  const [selectedTCPIPLayer, setSelectedTCPIPLayer] = useState<number | null>(null);
  const [hoveredOSILayer, setHoveredOSILayer] = useState<number | null>(null);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({
        onComplete: () => {
          onAnimationComplete?.();
        },
      });
      
      animationRef.current = timeline;
      
      // Handle initial state based on playing status
      if (animationState.isPlaying) {
        // Animation will play - set initial hidden state
        gsap.set('.tcpip-layer', { opacity: 0, x: -50 });
        gsap.set('.osi-layer', { opacity: 0, x: 50 });
        gsap.set('.mapping-line', { opacity: 0, strokeDashoffset: 100 });
        gsap.set('.mapping-label', { opacity: 0, scale: 0.5 });
        gsap.set('.comparison-text', { opacity: 0 });
      } else {
        // Not playing - show everything immediately
        gsap.set('.tcpip-layer', { opacity: 1, x: 0 });
        gsap.set('.osi-layer', { opacity: 1, x: 0 });
        gsap.set('.mapping-line', { opacity: 0.6, strokeDashoffset: 0 });
        gsap.set('.mapping-label', { opacity: 1, scale: 1 });
        gsap.set('.comparison-text', { opacity: 1 });
      }
      
      if (animationState.isPlaying) {
        // Initial setup
        gsap.set('.tcpip-layer', { opacity: 0, x: -50 });
        gsap.set('.osi-layer', { opacity: 0, x: 50 });
        gsap.set('.mapping-line', { opacity: 0, strokeDashoffset: 100 });
        gsap.set('.mapping-label', { opacity: 0, scale: 0.5 });
        gsap.set('.comparison-text', { opacity: 0 });
        
        // Animate TCP/IP layers (left side)
        timeline.to('.tcpip-layer', { 
          opacity: 1, 
          x: 0, 
          duration: 0.5, 
          stagger: 0.15,
          ease: 'power2.out'
        });
        
        // Animate OSI layers (right side)
        timeline.to('.osi-layer', { 
          opacity: 1, 
          x: 0, 
          duration: 0.5, 
          stagger: 0.08,
          ease: 'power2.out'
        }, '-=0.3');
        
        // Show mapping lines
        tcpipLayers.forEach((layer, index) => {
          layer.osiMapping.forEach((osiNum) => {
            timeline.to(`.mapping-line-${layer.number}-${osiNum}`, { 
              strokeDashoffset: 0, 
              opacity: 0.6,
              duration: 0.5,
              ease: 'power2.out'
            }, `-=${index * 0.1}`);
            
            timeline.to(`.mapping-label-${layer.number}-${osiNum}`, { 
              opacity: 1, 
              scale: 1,
              duration: 0.3,
              ease: 'back.out(1.5)'
            }, `-=${index * 0.1}`);
          });
        });
        
        // Show comparison text
        timeline.to('.comparison-text', { opacity: 1, y: 0, duration: 0.5 }, '+=0.3');
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
  
  const width = 1000;
  const height = 600;
  
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[1000px]">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto"
          role="img"
          aria-label={t('chapter3')}
        >
          <defs>
            <filter id="layerShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#0f172a" floodOpacity="0.08" />
            </filter>
            <linearGradient id="tcpipGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f8fafc" />
            </linearGradient>
            <marker id="arrowRight" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
              <path d="M0,0 L0,8 L8,4 Z" fill="#64748b" />
            </marker>
          </defs>
          
          {/* Title */}
          <text x={width / 2} y={30} textAnchor="middle" fontSize="20" fontWeight="700" fill="#0f172a">
            {language === 'bn' ? 'TCP/IP মডেল এবং এর লেয়ারগুলো' : 'The TCP/IP Model and Its Layers'}
          </text>
          
          {/* Column headers */}
          <text x={180} y={65} textAnchor="middle" fontSize="13" fontWeight="600" fill="#2563eb">
            {language === 'bn' ? 'TCP/IP মডেল (৪ লেয়ার)' : 'TCP/IP Model (4 Layers)'}
          </text>
          <text x={width - 180} y={65} textAnchor="middle" fontSize="13" fontWeight="600" fill="#2563eb">
            {language === 'bn' ? 'OSI মডেল (৭ লেয়ার)' : 'OSI Model (7 Layers)'}
          </text>
          <text x={width / 2} y={65} textAnchor="middle" fontSize="13" fontWeight="600" fill="#f59e0b">
            {language === 'bn' ? 'ম্যাপিং (Mapping)' : 'Mapping'}
          </text>
          
          {/* TCP/IP Layers (Left) */}
          {tcpipLayers.map((layer, index) => {
            const y = 90 + index * 120;
            const isSelected = selectedTCPIPLayer === layer.number;
            
            return (
              <g 
                key={layer.number}
                className="tcpip-layer"
                transform={`translate(20, ${y})`}
                onClick={() => setSelectedTCPIPLayer(layer.number === selectedTCPIPLayer ? null : layer.number)}
                style={{ cursor: 'pointer' }}
                filter="url(#layerShadow)"
              >
                {/* Layer background */}
                <rect 
                  x={0} 
                  y={0} 
                  width={320} 
                  height={110} 
                  rx={12}
                  fill={layer.bgColor}
                  stroke={isSelected ? layer.color : '#e2e8f0'}
                  strokeWidth={isSelected ? 3 : 1.5}
                />
                
                {/* Layer number badge */}
                <circle 
                  cx={40} 
                  cy={55} 
                  r={28}
                  fill={layer.color}
                  stroke="white"
                  strokeWidth={2}
                />
                <text 
                  x={40} 
                  y={61} 
                  textAnchor="middle" 
                  fontSize="20" 
                  fontWeight="700" 
                  fill="white"
                >
                  {layer.number}
                </text>
                
                {/* Layer content */}
                <g transform="translate(85, 20)">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {layer.icon}
                  </div>
                  <text x={35} y={10} fontSize="15" fontWeight="700" fill={layer.color}>
                    {language === 'bn' ? (
                      layer.number === 4 ? 'অ্যাপ্লিকেশন' :
                      layer.number === 3 ? 'ট্রান্সপোর্ট' :
                      layer.number === 2 ? 'ইন্টারনেট' :
                      'নেটওয়ার্ক অ্যাক্সেস'
                    ) : layer.name}
                  </text>
                  <text x={35} y={30} fontSize="11" fill="#64748b" width={220}>
                    {layer.responsibility}
                  </text>
                  
                  {/* Protocols */}
                  <g transform="translate(0, 45)">
                    {layer.protocols.slice(0, 5).map((proto, i) => (
                      <text
                        key={proto}
                        x={i * 65}
                        y={0}
                        fontSize="9"
                        fontWeight="500"
                        fill="#334155"
                        className="protocol-tag"
                      >
                        {proto}
                      </text>
                    ))}
                    {layer.protocols.length > 5 && (
                      <text x={5 * 65} y={0} fontSize="9" fill="#94a3b8">
                        +{layer.protocols.length - 5} more
                      </text>
                    )}
                  </g>
                </g>
                
                {/* OSI Mapping indicator */}
                <g transform="translate(320, 55)">
                  <text x={0} y={0} textAnchor="middle" fontSize="10" fontWeight="500" fill="#64748b">
                    OSI Layers: {layer.osiMapping.join(', ')}
                  </text>
                </g>
              </g>
            );
          })}
          
          {/* OSI Layers (Right) */}
          {osiLayers.map((layer, index) => {
            const y = 90 + index * 65;
            const isHovered = hoveredOSILayer === layer.number;
            
            return (
              <g 
                key={layer.number}
                className="osi-layer"
                transform={`translate(${width - 340}, ${y})`}
                onMouseEnter={() => setHoveredOSILayer(layer.number)}
                onMouseLeave={() => setHoveredOSILayer(null)}
                style={{ cursor: 'default' }}
                filter="url(#layerShadow)"
              >
                <rect 
                  x={0} 
                  y={0} 
                  width={320} 
                  height={60} 
                  rx={8}
                  fill={isHovered ? layer.color + '15' : '#f8fafc'}
                  stroke={isHovered ? layer.color : '#e2e8f0'}
                  strokeWidth={isHovered ? 2 : 1}
                />
                
                <circle 
                  cx={35} 
                  cy={30} 
                  r={18}
                  fill={layer.color}
                  stroke="white"
                  strokeWidth={2}
                />
                <text 
                  x={35} 
                  y={35} 
                  textAnchor="middle" 
                  fontSize="13" 
                  fontWeight="700" 
                  fill="white"
                >
                  {layer.number}
                </text>
                
                <text 
                  x={65} 
                  y={22} 
                  fontSize="13" 
                  fontWeight="600" 
                  fill={layer.color}
                >
                  {layer.name}
                </text>
                <text 
                  x={65} 
                  y={42} 
                  fontSize="10" 
                  fill="#64748b"
                >
                  {language === 'bn' ? 'OSI রেফারেন্স মডেল লেয়ার' : 'OSI Reference Model Layer'}
                </text>
              </g>
            );
          })}
          
          {/* Mapping Lines (Center) */}
          {tcpipLayers.map((tcpipLayer) => (
            <g key={tcpipLayer.number}>
              {tcpipLayer.osiMapping.map((osiNum) => {
                const tcpipIndex = tcpipLayers.findIndex(l => l.number === tcpipLayer.number);
                const osiIndex = osiLayers.findIndex(l => l.number === osiNum);
                
                const tcpipY = 90 + tcpipIndex * 120 + 55;
                const osiY = 90 + osiIndex * 65 + 30;
                
                const startX = 340;
                const endX = width - 340;
                const midX = (startX + endX) / 2;
                
                return (
                  <g key={`${tcpipLayer.number}-${osiNum}`}>
                    {/* Curved line */}
                    <path
                      className={`mapping-line mapping-line-${tcpipLayer.number}-${osiNum}`}
                      d={`M ${startX} ${tcpipY} Q ${midX} ${tcpipY} ${midX} ${(tcpipY + osiY) / 2} Q ${midX} ${osiY} ${endX} ${osiY}`}
                      stroke={tcpipLayer.color}
                      strokeWidth={2}
                      fill="none"
                      strokeDasharray="100"
                      strokeDashoffset="100"
                      opacity={0}
                      markerEnd="url(#arrowRight)"
                    />
                    
                    {/* Mapping label */}
                    <text
                      className={`mapping-label mapping-label-${tcpipLayer.number}-${osiNum}`}
                      x={midX}
                      y={(tcpipY + osiY) / 2 - 10}
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight="600"
                      fill={tcpipLayer.color}
                      opacity={0}
                      transform={`scale(0.5) translate(${midX}, ${(tcpipY + osiY) / 2 - 10})`}
                    >
                      {language === 'bn' ? 'ম্যাপ' : 'maps to'}
                    </text>
                  </g>
                );
              })}
            </g>
          ))}
          
          {/* Comparison text */}
          <g className="comparison-text" transform={`translate(50, ${height - 80})`} opacity={0} y="10">
            <rect x={0} y={0} width={width - 100} height={70} rx={8} fill="#fffbeb" stroke="#f59e0b" strokeWidth={1} />
            <text x={15} y={20} fontSize="11" fontWeight="600" fill="#78350f">
              {language === 'bn' ? 'প্রধান পার্থক্য:' : 'Key Differences:'}
            </text>
            <text x={15} y={38} fontSize="10" fill="#92400e">
              {language === 'bn' ? '• TCP/IP: ৪ লেয়ার (ব্যবহারিক ইমপ্লিমেন্টেশন) | OSI: ৭ লেয়ার (সিদ্ধান্তিক রেফারেন্স)' : '• TCP/IP: 4 layers (practical implementation) | OSI: 7 layers (theoretical reference)'}
            </text>
            <text x={15} y={54} fontSize="10" fill="#92400e">
              {language === 'bn' ? '• OSI লেয়ার ৫, ৬, ৭ → TCP/IP অ্যাপ্লিকেশন লেয়ারে গ্রুপ করা হয়েছে' : '• OSI Layers 5, 6, 7 → grouped into TCP/IP Application layer'}
            </text>
            <text x={15} y={68} fontSize="10" fill="#92400e">
              {language === 'bn' ? '• OSI লেয়ার ১, ২ → TCP/IP নেটওয়ার্ক অ্যাক্সেস লেয়ারে গ্রুপ করা হয়েছে' : '• OSI Layers 1, 2 → grouped into TCP/IP Network Access layer'}
            </text>
          </g>
        </svg>
      </div>
      
      {/* Detail Panel */}
      {selectedTCPIPLayer && (
        <div className="mt-4 w-full max-w-[1000px] animate-slide-up">
          <TCPIPLayerDetailPanel 
            layer={tcpipLayers.find(l => l.number === selectedTCPIPLayer)!} 
            language={language}
            onClose={() => setSelectedTCPIPLayer(null)}
          />
        </div>
      )}
    </div>
  );
});

interface Chapter3Props extends DiagramProps {}

function TCPIPLayerDetailPanel({ layer, language, onClose }: { layer: TCPIPLayer; language: 'en' | 'bn'; onClose: () => void }) {
  const layerNamesBn: Record<number, string> = {
    4: 'অ্যাপ্লিকেশন লেয়ার',
    3: 'ট্রান্সপোর্ট লেয়ার',
    2: 'ইন্টারনেট লেয়ার',
    1: 'নেটওয়ার্ক অ্যাক্সেস / লিংক লেয়ার',
  };
  
  const osiNamesBn: Record<number, string> = {
    7: 'অ্যাপ্লিকেশন', 6: 'প্রেজেন্টেশন', 5: 'সেশন',
    4: 'ট্রান্সপোর্ট', 3: 'নেটওয়ার্ক', 2: 'ডেটা লিংক', 1: 'ফিজিক্যাল'
  };
  
  return (
    <div className="card p-4 border-l-4" style={{ borderColor: layer.color }}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: layer.color }}>
            {layer.icon}
          </div>
          <div>
            <h4 className="text-lg font-bold text-slate-900">
              Layer {layer.number}: {language === 'bn' ? layerNamesBn[layer.number] : layer.name}
            </h4>
            <p className="text-sm text-slate-600 mt-1">{layer.responsibility}</p>
          </div>
        </div>
        <button onClick={onClose} className="btn-icon p-1 text-slate-400 hover:text-slate-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <h5 className="font-medium text-slate-700 mb-2">{language === 'bn' ? 'প্রোটোকলগুলো:' : 'Protocols:'}</h5>
          <div className="flex flex-wrap gap-2">
            {layer.protocols.map((proto) => (
              <span key={proto} className="badge-primary text-xs">{proto}</span>
            ))}
          </div>
        </div>
        <div>
          <h5 className="font-medium text-slate-700 mb-2">{language === 'bn' ? 'OSI লেয়ার ম্যাপিং:' : 'OSI Layer Mapping:'}</h5>
          <div className="flex flex-wrap gap-1">
            {layer.osiMapping.map((osiNum) => (
              <span key={osiNum} className="badge" style={{ backgroundColor: osiLayers.find(l => l.number === osiNum)?.color + '20', color: osiLayers.find(l => l.number === osiNum)?.color }}>
                OSI L{osiNum}: {language === 'bn' ? osiNamesBn[osiNum] : osiLayers.find(l => l.number === osiNum)?.name}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h5 className="font-medium text-slate-700 mb-2">{language === 'bn' ? 'দায়িত্ব:' : 'Responsibility:'}</h5>
          <p className="text-sm text-slate-600">{layer.responsibility}</p>
        </div>
      </div>
      
      <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200">
        <h5 className="font-medium text-slate-700 mb-2">{language === 'bn' ? 'গুরুত্বপূর্ণ পয়েন্ট:' : 'Key Points:'}</h5>
        <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
          {layer.number === 4 && (
            <>
              <li>{language === 'bn' ? 'OSI-এর টপ ৩ লেয়ার (Application, Presentation, Session) একসাথে এখানে মিলে যায়' : 'Combines OSI top 3 layers (Application, Presentation, Session)'}</li>
              <li>{language === 'bn' ? 'ব্যবহারকারীর অ্যাপ্লিকেশন (ওয়েব ব্রাউজার, ইমেইল ক্লায়েন্ট) সরাসরি এখানে কাজ করে' : 'User applications (browsers, email clients) interface directly here'}</li>
            </>
          )}
          {layer.number === 3 && (
            <>
              <li>{language === 'bn' ? 'OSI Transport লেয়ারের সাথে সরাসরি ম্যাপ হয়' : 'Maps directly to OSI Transport layer'}</li>
              <li>{language === 'bn' ? 'TCP (বিশ্বাসযোগ্য স্ট্রিম) এবং UDP (ডেটাগ্রাম) দুটি প্রধান প্রোটোকল' : 'TCP (reliable stream) and UDP (datagram) are the two main protocols'}</li>
            </>
          )}
          {layer.number === 2 && (
            <>
              <li>{language === 'bn' ? 'OSI Network লেয়ারের সাথে সরাসরি ম্যাপ হয়' : 'Maps directly to OSI Network layer'}</li>
              <li>{language === 'bn' ? 'IP (IPv4/IPv6) হলো মূল প্রোটোকল; রাউটিং এবং লজিক্যাল অ্যাড্রেসিং এখানে' : 'IP (IPv4/IPv6) is the core protocol; routing and logical addressing here'}</li>
            </>
          )}
          {layer.number === 1 && (
            <>
              <li>{language === 'bn' ? 'OSI Data Link এবং Physical লেয়ার একসাথে এখানে মিলে যায়' : 'Combines OSI Data Link and Physical layers'}</li>
              <li>{language === 'bn' ? 'ইথারনেট, ওয়াই-ফাই, ARP, NDP ইত্যাদি এখানে কাজ করে' : 'Ethernet, Wi-Fi, ARP, NDP operate here'}</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}
export default Chapter3;
