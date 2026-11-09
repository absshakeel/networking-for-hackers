import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { DiagramProps } from '../../../types';

interface OSILayer {
  number: number;
  name: string;
  responsibility: string;
  protocols: string[];
  pdu: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}

const layers: OSILayer[] = [
  {
    number: 7,
    name: 'Application',
    responsibility: 'Network services to applications',
    protocols: ['HTTP', 'HTTPS', 'DNS', 'SMTP', 'SSH', 'FTP'],
    pdu: 'Data',
    color: '#0f172a',
    bgColor: '#f8fafc',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 16l4-16M6 16c0-1.1.9-2 2-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4z" /></svg>
  },
  {
    number: 6,
    name: 'Presentation',
    responsibility: 'Data translation, encryption, compression',
    protocols: ['TLS/SSL', 'MIME', 'ASCII', 'JPEG', 'MPEG'],
    pdu: 'Data',
    color: '#1e3a8a',
    bgColor: '#eff6ff',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
  },
  {
    number: 5,
    name: 'Session',
    responsibility: 'Dialog control, synchronization',
    protocols: ['NetBIOS', 'RPC', 'PPTP', 'SOCKS'],
    pdu: 'Data',
    color: '#1e40af',
    bgColor: '#dbeafe',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
  },
  {
    number: 4,
    name: 'Transport',
    responsibility: 'End-to-end delivery, reliability, flow control',
    protocols: ['TCP', 'UDP', 'SCTP', 'DCCP'],
    pdu: 'Segment',
    color: '#166534',
    bgColor: '#dcfce7',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
  },
  {
    number: 3,
    name: 'Network',
    responsibility: 'Logical addressing, routing, path determination',
    protocols: ['IPv4', 'IPv6', 'ICMP', 'IPsec', 'OSPF', 'BGP'],
    pdu: 'Packet',
    color: '#78350f',
    bgColor: '#fef3c7',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
  },
  {
    number: 2,
    name: 'Data Link',
    responsibility: 'Physical addressing, error detection, frame sync',
    protocols: ['Ethernet', 'Wi-Fi (802.11)', 'PPP', 'HDLC', 'Frame Relay'],
    pdu: 'Frame',
    color: '#7c2d12',
    bgColor: '#fed7aa',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
  },
  {
    number: 1,
    name: 'Physical',
    responsibility: 'Bit transmission, physical media, signaling',
    protocols: ['Ethernet (10/100/1000Base-T)', 'Fiber', 'Coaxial', 'Wireless'],
    pdu: 'Bits',
    color: '#374151',
    bgColor: '#e5e7eb',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" /></svg>
  },
];

const layerDataFlow = [
  { layer: 7, direction: 'down', label: 'Application Data' },
  { layer: 6, direction: 'down', label: 'Add Presentation Header' },
  { layer: 5, direction: 'down', label: 'Add Session Header' },
  { layer: 4, direction: 'down', label: 'Add TCP Header → Segment' },
  { layer: 3, direction: 'down', label: 'Add IP Header → Packet' },
  { layer: 2, direction: 'down', label: 'Add Ethernet Header/Trailer → Frame' },
  { layer: 1, direction: 'down', label: 'Convert to Bits → Signal' },
  { layer: 1, direction: 'up', label: 'Receive Bits' },
  { layer: 2, direction: 'up', label: 'Remove Frame Header/Trailer' },
  { layer: 3, direction: 'up', label: 'Remove IP Header' },
  { layer: 4, direction: 'up', label: 'Remove TCP Header → Reassemble' },
  { layer: 5, direction: 'up', label: 'Session Processing' },
  { layer: 6, direction: 'up', label: 'Decrypt/Decode' },
  { layer: 7, direction: 'up', label: 'Deliver to Application' },
];

export const Chapter2 = React.memo(function Chapter2({ 
  language, 
  animationState, 
  onAnimationComplete 
}: Chapter2Props) {
  const { t } = useTranslation();
  const svgRef = useRef<SVGSVGElement>(null);
  const animationRef = useRef<gsap.core.Timeline | null>(null);
  const [selectedLayer, setSelectedLayer] = useState<number | null>(null);
  
  const handleLayerClick = (layerNum: number) => {
    setSelectedLayer(layerNum === selectedLayer ? null : layerNum);
  };
  
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
        gsap.set('.layer-row', { opacity: 0, x: -30 });
        gsap.set('.arrow-down, .arrow-up', { opacity: 0, scaleY: 0 });
        gsap.set('.data-unit', { opacity: 0, scale: 0.5 });
        gsap.set('.encapsulation-label', { opacity: 0 });
      } else {
        // Not playing - show everything immediately
        gsap.set('.layer-row', { opacity: 1, x: 0 });
        gsap.set('.arrow-down, .arrow-up', { opacity: 1, scaleY: 1 });
        gsap.set('.data-unit', { opacity: 1, scale: 1 });
        gsap.set('.encapsulation-label', { opacity: 1 });
      }
      
      if (animationState.isPlaying) {
        // Initial setup
        gsap.set('.layer-row', { opacity: 0, x: -30 });
        gsap.set('.arrow-down, .arrow-up', { opacity: 0, scaleY: 0 });
        gsap.set('.data-unit', { opacity: 0, scale: 0.5 });
        gsap.set('.encapsulation-label', { opacity: 0 });
        
        // Animate layers appearing from bottom to top (Physical to Application)
        timeline.to('.layer-row', { 
          opacity: 1, 
          x: 0, 
          duration: 0.4, 
          stagger: 0.08,
          ease: 'power2.out'
        });
        
        // Show encapsulation process
        layerDataFlow.forEach((step, index) => {
          const layerSelector = `.layer-row[data-layer="${step.layer}"]`;
          const isDown = step.direction === 'down';
          
          timeline.to(`${layerSelector} .layer-highlight`, { 
            opacity: 0.3, 
            duration: 0.2 
          }, `step${index}`);
          
          timeline.to(`${layerSelector} .data-unit`, { 
            opacity: 1, 
            scale: 1, 
            duration: 0.3,
            ease: 'back.out(1.5)'
          }, `step${index}+=0.1`);
          
          timeline.to(`${layerSelector} .encapsulation-label`, { 
            opacity: 1, 
            x: isDown ? -10 : 10,
            duration: 0.3 
          }, `step${index}+=0.15`);
          
          // Show arrow
          if (index < layerDataFlow.length - 1) {
            const arrowClass = isDown ? '.arrow-down' : '.arrow-up';
            timeline.to(`${layerSelector} ${arrowClass}`, { 
              opacity: 1, 
              scaleY: 1, 
              duration: 0.3,
              transformOrigin: isDown ? 'top' : 'bottom'
            }, `step${index}+=0.2`);
          }
          
          // Reset highlight
          timeline.to(`${layerSelector} .layer-highlight`, { 
            opacity: 0, 
            duration: 0.2 
          }, `step${index}+=0.8`);
        });
        
        // Final state - show all data units
        timeline.to('.data-unit', { opacity: 1, duration: 0.3 }, '+=0.5');
        timeline.to('.encapsulation-label', { opacity: 0.7, duration: 0.3 }, '-=0.2');
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
  
  const width = 900;
  const height = 650;
  
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[900px]">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto"
          role="img"
          aria-label={t('chapter2')}
        >
          <defs>
            <filter id="layerShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#0f172a" floodOpacity="0.08" />
            </filter>
            <linearGradient id="highlightGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.15" />
              <stop offset="50%" stopColor="currentColor" stopOpacity="0.3" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.15" />
            </linearGradient>
            <marker id="arrowDown" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L0,10 L10,5 Z" fill="#64748b" />
            </marker>
            <marker id="arrowUp" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto" markerUnits="strokeWidth">
              <path d="M0,10 L10,10 L5,0 Z" fill="#64748b" />
            </marker>
          </defs>
          
          {/* Title */}
          <text x={width / 2} y={35} textAnchor="middle" fontSize="20" fontWeight="700" fill="#0f172a">
            {language === 'bn' ? 'ISO/OSI রেফারেন্স মডেল — ৭ লেয়ার' : 'ISO/OSI Reference Model — Seven Layers'}
          </text>
          <text x={width / 2} y={55} textAnchor="middle" fontSize="12" fill="#64748b">
            {language === 'bn' ? 'ইনক্যাপসুলেশন: প্রেরকের সাইডে নিচে → ডিক্যাপসুলেশন: প্রাপকের সাইডে উপরে' : 'Encapsulation: Sender side down → Decapsulation: Receiver side up'}
          </text>
          
          {/* Sender side label */}
          <text x={120} y={80} textAnchor="middle" fontSize="11" fontWeight="600" fill="#2563eb">
            {language === 'bn' ? 'পাঠানকারী (Sender)' : 'SENDER'}
          </text>
          {/* Receiver side label */}
          <text x={width - 120} y={80} textAnchor="middle" fontSize="11" fontWeight="600" fill="#22c55e">
            {language === 'bn' ? 'প্রাপকারী (Receiver)' : 'RECEIVER'}
          </text>
          
          {layers.map((layer, index) => {
            const y = 100 + index * 75;
            const isSelected = selectedLayer === layer.number;
            
            return (
              <g 
                key={layer.number}
                className="layer-row"
                data-layer={layer.number}
                transform={`translate(0, ${y})`}
                onClick={() => handleLayerClick(layer.number)}
                style={{ cursor: 'pointer' }}
                filter="url(#layerShadow)"
              >
                {/* Layer background */}
                <rect 
                  x={20} 
                  y={0} 
                  width={width - 40} 
                  height={68} 
                  rx={10}
                  fill={layer.bgColor}
                  stroke={isSelected ? layer.color : '#e2e8f0'}
                  strokeWidth={isSelected ? 2 : 1}
                  className={isSelected ? 'animate-pulse-soft' : ''}
                />
                
                {/* Highlight overlay for animation */}
                <rect 
                  className="layer-highlight"
                  x={20} 
                  y={0} 
                  width={width - 40} 
                  height={68} 
                  rx={10}
                  fill={layer.color}
                  opacity={0}
                />
                
                {/* Layer number */}
                <circle 
                  cx={50} 
                  cy={34} 
                  r={22}
                  fill={layer.color}
                  stroke="white"
                  strokeWidth={2}
                />
                <text 
                  x={50} 
                  y={39} 
                  textAnchor="middle" 
                  fontSize="16" 
                  fontWeight="700" 
                  fill="white"
                >
                  {layer.number}
                </text>
                
                {/* Layer name and icon */}
                <g transform="translate(90, 18)">
                  {layer.icon}
                  <text x={35} y={10} fontSize="16" fontWeight="700" fill={layer.color}>
                    {language === 'bn' ? (
                      layer.number === 7 ? 'অ্যাপ্লিকেশন' :
                      layer.number === 6 ? 'প্রেজেন্টেশন' :
                      layer.number === 5 ? 'সেশন' :
                      layer.number === 4 ? 'ট্রান্সপোর্ট' :
                      layer.number === 3 ? 'নেটওয়ার্ক' :
                      layer.number === 2 ? 'ডেটা লিংক' :
                      'ফিজিক্যাল'
                    ) : layer.name}
                  </text>
                  <text x={35} y={30} fontSize="11" fill="#64748b">
                    {layer.responsibility}
                  </text>
                </g>
                
                {/* Protocols */}
                <g transform="translate(90, 50)">
                  {layer.protocols.slice(0, 4).map((proto, i) => (
                    <text
                      key={proto}
                      x={i * 100}
                      y={0}
                      fontSize="10"
                      fontWeight="500"
                      fill="#334155"
                    >
                      {proto}
                    </text>
                  ))}
                  {layer.protocols.length > 4 && (
                    <text x={4 * 100} y={0} fontSize="10" fill="#94a3b8">
                      +{layer.protocols.length - 4} more
                    </text>
                  )}
                </g>
                
                {/* PDU */}
                <g transform={`translate(${width - 200}, 18)`}>
                  <rect x={0} y={-10} width={90} height={30} rx={6} fill={layer.color} opacity={0.15} />
                  <text x={45} y={8} textAnchor="middle" fontSize="11" fontWeight="600" fill={layer.color}>
                    PDU: {layer.pdu}
                  </text>
                </g>
                
                {/* Data unit visualization */}
                <g className="data-unit" transform={`translate(${width - 160}, 30)`} opacity={0}>
                  <rect x={0} y={-8} width={140} height={16} rx={3} fill={layer.color} opacity={0.2} stroke={layer.color} strokeWidth={1} />
                  <text x={70} y={3} textAnchor="middle" fontSize="9" fontWeight="600" fill={layer.color}>
                    {layer.pdu}
                  </text>
                </g>
                
                {/* Encapsulation label */}
                <g className="encapsulation-label" transform={`translate(${width - 160}, 50)`} opacity={0}>
                  <text x={70} y={0} textAnchor="middle" fontSize="9" fill={layer.color}>
                    {layerDataFlow.find(s => s.layer === layer.number)?.label || ''}
                  </text>
                </g>
                
                {/* Arrows between layers */}
                {index < layers.length - 1 && (
                  <g transform={`translate(${width / 2}, 68)`}>
                    <line 
                      className="arrow-down"
                      x1={0} y1={0} x2={0} y2={7}
                      stroke="#64748b" strokeWidth={2}
                      markerEnd="url(#arrowDown)"
                      opacity={0}
                    />
                    <line 
                      className="arrow-up"
                      x1={0} y1={7} x2={0} y2={0}
                      stroke="#64748b" strokeWidth={2}
                      markerEnd="url(#arrowUp)"
                      opacity={0}
                    />
                  </g>
                )}
              </g>
            );
          })}
          
          {/* Encapsulation summary at bottom */}
          <g transform={`translate(40, ${height - 90})`} className="encapsulation-summary">
            <rect x={0} y={0} width={width - 80} height={80} rx={8} fill="#f8fafc" stroke="#e2e8f0" />
            <text x={20} y={20} fontSize="12" fontWeight="600" fill="#0f172a">
              {language === 'bn' ? 'ইনক্যাপসুলেশন প্রক্রিয়া (Encapsulation Process):' : 'Encapsulation Process:'}
            </text>
            <text x={20} y={42} fontSize="11" fill="#334155" fontFamily="monospace">
              {language === 'bn' ? 'অ্যাপ্লিকেশন ডেটা → TCP সেগমেন্ট → IP প্যাকেট → ইথারনেট ফ্রেম → বিটস' : 'Application Data → TCP Segment → IP Packet → Ethernet Frame → Bits'}
            </text>
            <text x={20} y={62} fontSize="11" fill="#64748b" fontFamily="monospace">
              {language === 'bn' ? 'ডিক্যাপসুলেশন: বিপরীত ক্রমে (Receiver side: Bits → Frame → Packet → Segment → Data)' : 'Decapsulation: Reverse order (Receiver: Bits → Frame → Packet → Segment → Data)'}
            </text>
          </g>
        </svg>
      </div>
      
      {/* Layer Detail Panel */}
      {selectedLayer && (
        <div className="mt-4 w-full max-w-[900px] animate-slide-up">
          <LayerDetailPanel 
            layer={layers.find(l => l.number === selectedLayer)!} 
            language={language}
            onClose={() => setSelectedLayer(null)}
          />
        </div>
      )}
    </div>
  );
});

interface Chapter2Props extends DiagramProps {}

function LayerDetailPanel({ layer, language, onClose }: { layer: OSILayer; language: 'en' | 'bn'; onClose: () => void }) {
  const layerNamesBn: Record<number, string> = {
    7: 'অ্যাপ্লিকেশন লেয়ার',
    6: 'প্রেজেন্টেশন লেয়ার',
    5: 'সেশন লেয়ার',
    4: 'ট্রান্সপোর্ট লেয়ার',
    3: 'নেটওয়ার্ক লেয়ার',
    2: 'ডেটা লিংক লেয়ার',
    1: 'ফিজিক্যাল লেয়ার',
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
      
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h5 className="font-medium text-slate-700 mb-2">{language === 'bn' ? 'প্রোটোকলগুলো:' : 'Protocols:'}</h5>
          <div className="flex flex-wrap gap-2">
            {layer.protocols.map((proto) => (
              <span key={proto} className="badge-primary text-xs">{proto}</span>
            ))}
          </div>
        </div>
        <div>
          <h5 className="font-medium text-slate-700 mb-2">{language === 'bn' ? 'প্রোটোকল ডেটা ইউনিট (PDU):' : 'Protocol Data Unit (PDU):'}</h5>
          <span className="badge" style={{ backgroundColor: layer.bgColor, color: layer.color }}>
            {layer.pdu}
          </span>
        </div>
      </div>
      
      <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200">
        <h5 className="font-medium text-slate-700 mb-1">{language === 'bn' ? 'গুরুত্বপূর্ণ তথ্য:' : 'Key Points:'}</h5>
        <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
          {layer.number === 7 && (
            <>
              <li>{language === 'bn' ? 'সর্বোচ্চ লেয়ার; ব্যবহারকারীর অ্যাপ্লিকেশন সরাসরি এর সাথে ইন্টারঅ্যাক্ট করে' : 'Top layer; user applications interact directly with this layer'}</li>
              <li>{language === 'bn' ? 'HTTP, DNS, SMTP, SSH ইত্যাদি এখানে কাজ করে' : 'HTTP, DNS, SMTP, SSH operate here'}</li>
            </>
          )}
          {layer.number === 6 && (
            <>
              <li>{language === 'bn' ? 'ডেটা ফরম্যাট, এনক্রিপশন (TLS/SSL), কম্প্রেশন পরিচালনা করে' : 'Handles data format, encryption (TLS/SSL), compression'}</li>
              <li>{language === 'bn' ? 'আবস্ট্র্যাকশন লেয়ার — অ্যাপ্লিকেশনকে নেটওয়ার্ক ফরম্যাট থেকে আলাদা করে' : 'Abstraction layer — separates apps from network formats'}</li>
            </>
          )}
          {layer.number === 5 && (
            <>
              <li>{language === 'bn' ? 'সেশন স্থাপন, রক্ষা এবং সমাপ্তি নিয়ন্ত্রণ করে' : 'Controls session establishment, maintenance, termination'}</li>
              <li>{language === 'bn' ? 'সিনক্রোনাইজেশন পয়েন্ট এবং ডায়ালগ কন্ট্রোল প্রদান করে' : 'Provides synchronization points and dialog control'}</li>
            </>
          )}
          {layer.number === 4 && (
            <>
              <li>{language === 'bn' ? 'এন্ড-টু-এন্ড ডেলিভারি, विश्वাসযোগ্যতা, ফ্লো কন্ট্রোল' : 'End-to-end delivery, reliability, flow control'}</li>
              <li>{language === 'bn' ? 'TCP (বিশ্বাসযোগ্য) এবং UDP (দ্রুত, অবিশ্বাসযোগ্য) প্রধান প্রোটোকল' : 'TCP (reliable) and UDP (fast, unreliable) are main protocols'}</li>
            </>
          )}
          {layer.number === 3 && (
            <>
              <li>{language === 'bn' ? 'লজিক্যাল অ্যাড্রেসিং (IP), রাউটিং, পাথ ডিটার্মিনেশন' : 'Logical addressing (IP), routing, path determination'}</li>
              <li>{language === 'bn' ? 'রাউটার এই লেয়ারে কাজ করে; IP প্যাকেট রুট করে' : 'Routers operate here; route IP packets'}</li>
            </>
          )}
          {layer.number === 2 && (
            <>
              <li>{language === 'bn' ? 'ফিজিক্যাল অ্যাড্রেসিং (MAC), এরর ডিটেকশন, ফ্রেম সিঙ্ক্রোনাইজেশন' : 'Physical addressing (MAC), error detection, frame synchronization'}</li>
              <li>{language === 'bn' ? 'স্যুইচ এই লেয়ারে কাজ করে; MAC টেবিল অনুযায়ী ফ্রেম ফরওয়ার্ড করে' : 'Switches operate here; forward frames by MAC table'}</li>
            </>
          )}
          {layer.number === 1 && (
            <>
              <li>{language === 'bn' ? 'বিট ট্রান্সমিশন, ফিজিক্যাল মিডিয়া (কেবল, ফাইবার, ওয়ারলেস)' : 'Bit transmission, physical media (cable, fiber, wireless)'}</li>
              <li>{language === 'bn' ? 'সিগন্যালিং, এনকোডিং, বaurল রেট, ক넥্টর স্পেসিফিকেশন' : 'Signaling, encoding, bit rate, connector specifications'}</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}
export default Chapter2;
