import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { DiagramProps } from '../../../types';

const encapsulationSteps = [
  {
    step: 1,
    title: 'Application Data',
    description: 'Original message from application',
    data: 'GET /index.html HTTP/1.1\r\nHost: example.com\r\n\r\n',
    layer: null,
  },
  {
    step: 2,
    title: 'TCP Segment',
    description: 'Transport layer adds TCP header',
    layer: {
      name: 'Transport (TCP)',
      shortName: 'TCP',
      headerFields: [
        { name: 'Source Port', size: '16 bits', description: 'Client port (ephemeral)' },
        { name: 'Dest Port', size: '16 bits', description: 'Server port (e.g., 80)' },
        { name: 'Sequence Number', size: '32 bits', description: 'Byte stream position' },
        { name: 'Ack Number', size: '32 bits', description: 'Next expected byte' },
        { name: 'Flags', size: '16 bits', description: 'SYN, ACK, FIN, RST, PSH, URG' },
        { name: 'Window Size', size: '16 bits', description: 'Flow control (receive buffer)' },
        { name: 'Checksum', size: '16 bits', description: 'Header + data integrity' },
        { name: 'Urgent Ptr', size: '16 bits', description: 'Urgent data pointer' },
      ],
      headerColor: '#166534',
      payloadColor: '#dcfce7',
    },
    data: 'TCP Header (20 bytes) + Application Data',
  },
  {
    step: 3,
    title: 'IP Packet',
    description: 'Network layer adds IP header',
    layer: {
      name: 'Internet (IPv4)',
      shortName: 'IP',
      headerFields: [
        { name: 'Version/IHL', size: '8 bits', description: 'IPv4 (4) + header length' },
        { name: 'DSCP/ECN', size: '8 bits', description: 'QoS + congestion notification' },
        { name: 'Total Length', size: '16 bits', description: 'Header + payload (bytes)' },
        { name: 'Identification', size: '16 bits', description: 'Fragment identification' },
        { name: 'Flags/Frag Offset', size: '16 bits', description: 'DF, MF + fragment offset' },
        { name: 'TTL', size: '8 bits', description: 'Time to live (hop limit)' },
        { name: 'Protocol', size: '8 bits', description: 'TCP=6, UDP=17, ICMP=1' },
        { name: 'Header Checksum', size: '16 bits', description: 'Header integrity only' },
        { name: 'Src IP Address', size: '32 bits', description: 'Source IPv4 address' },
        { name: 'Dst IP Address', size: '32 bits', description: 'Destination IPv4 address' },
      ],
      headerColor: '#78350f',
      payloadColor: '#fef3c7',
    },
    data: 'IP Header (20 bytes) + TCP Segment',
  },
  {
    step: 4,
    title: 'Ethernet Frame',
    description: 'Link layer adds frame header/trailer',
    layer: {
      name: 'Link (Ethernet II)',
      shortName: 'ETH',
      headerFields: [
        { name: 'Dst MAC', size: '48 bits', description: 'Destination MAC address' },
        { name: 'Src MAC', size: '48 bits', description: 'Source MAC address' },
        { name: 'EtherType', size: '16 bits', description: '0x0800 = IPv4, 0x86DD = IPv6' },
      ],
      trailerFields: [
        { name: 'FCS', size: '32 bits', description: 'Frame Check Sequence (CRC32)' },
      ],
      headerColor: '#374151',
      payloadColor: '#e5e7eb',
    },
    data: 'Ethernet Header (14 bytes) + IP Packet + FCS (4 bytes)',
  },
  {
    step: 5,
    title: 'Physical Transmission',
    description: 'Bits on the wire (preamble + SFD + frame)',
    layer: {
      name: 'Physical',
      shortName: 'PHY',
      headerFields: [
        { name: 'Preamble', size: '56 bits', description: '7 bytes of 10101010...' },
        { name: 'SFD', size: '8 bits', description: 'Start Frame Delimiter (10101011)' },
      ],
      headerColor: '#1e293b',
      payloadColor: '#f1f5f9',
    },
    data: 'Preamble + SFD + Ethernet Frame',
  },
];

const decapsulationSteps = [
  { step: 1, title: 'Receive Bits', description: 'Physical layer detects signals', action: 'Remove preamble/SFD' },
  { step: 2, title: 'Ethernet Frame', description: 'Link layer validates FCS', action: 'Check FCS, remove header/trailer' },
  { step: 3, title: 'IP Packet', description: 'Network layer checks IP header', action: 'Verify checksum, remove IP header' },
  { step: 4, title: 'TCP Segment', description: 'Transport layer reassembles', action: 'Verify checksum, remove TCP header' },
  { step: 5, title: 'Application Data', description: 'Deliver to application', action: 'Pass data to application layer' },
];

export const Chapter4 = React.memo(function Chapter4({ 
  language, 
  animationState, 
  onAnimationComplete 
}: Chapter4Props) {
  const { t } = useTranslation();
  const svgRef = useRef<SVGSVGElement>(null);
  const animationRef = useRef<gsap.core.Timeline | null>(null);
  const [currentPhase, setCurrentPhase] = useState<'encapsulation' | 'decapsulation'>('encapsulation');
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({
        onComplete: () => {
          onAnimationComplete?.();
        },
        onUpdate: () => {
          // Could track progress here
        },
      });
      
      animationRef.current = timeline;
      
      // Handle initial state based on playing status
      if (animationState.isPlaying) {
        // Animation will play - set initial hidden state
        gsap.set('.step-box', { opacity: 0, scale: 0.9 });
        gsap.set('.arrow-between', { opacity: 0, scaleX: 0 });
        gsap.set('.header-visual', { opacity: 0, x: -20 });
        gsap.set('.payload-visual', { opacity: 0, x: 20 });
      } else {
        // Not playing - show everything immediately
        gsap.set('.step-box', { opacity: 1, scale: 1 });
        gsap.set('.arrow-between', { opacity: 1, scaleX: 1 });
        gsap.set('.header-visual', { opacity: 1, x: 0 });
        gsap.set('.payload-visual', { opacity: 1, x: 0 });
      }
      
      if (animationState.isPlaying) {
        // Initial setup
        gsap.set('.step-box', { opacity: 0, scale: 0.9 });
        gsap.set('.arrow-between', { opacity: 0, scaleX: 0 });
        gsap.set('.header-visual', { opacity: 0, x: -20 });
        gsap.set('.payload-visual', { opacity: 0, x: 20 });
        
        if (currentPhase === 'encapsulation') {
          // Encapsulation animation
          encapsulationSteps.forEach((step, index) => {
            timeline.to(`.step-box-${step.step}`, { 
              opacity: 1, 
              scale: 1, 
              duration: 0.4, 
              ease: 'back.out(1.5)'
            }, index * 0.6);
            
            if (step.layer) {
              timeline.to(`.step-box-${step.step} .header-visual`, { 
                opacity: 1, 
                x: 0, 
                duration: 0.3 
              }, index * 0.6 + 0.2);
              
              timeline.to(`.step-box-${step.step} .payload-visual`, { 
                opacity: 1, 
                x: 0, 
                duration: 0.3 
              }, index * 0.6 + 0.3);
            }
            
            if (index < encapsulationSteps.length - 1) {
              timeline.to(`.arrow-between-${step.step}`, { 
                opacity: 1, 
                scaleX: 1, 
                duration: 0.3,
                transformOrigin: 'left center'
              }, index * 0.6 + 0.4);
            }
          });
        } else {
          // Decapsulation animation
          decapsulationSteps.forEach((step, index) => {
            timeline.to(`.step-box-${step.step}`, { 
              opacity: 1, 
              scale: 1, 
              duration: 0.4, 
              ease: 'back.out(1.5)'
            }, index * 0.6);
            
            if (index < decapsulationSteps.length - 1) {
              timeline.to(`.arrow-between-${step.step}`, { 
                opacity: 1, 
                scaleX: 1, 
                duration: 0.3,
                transformOrigin: 'left center'
              }, index * 0.6 + 0.4);
            }
          });
        }
      }
    }, svgRef.current);
    
    return () => ctx.revert();
  }, [animationState.isPlaying, animationState.speed, currentPhase, onAnimationComplete]);
  
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
  
  const width = 1100;
  const height = 550;
  
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[1100px]">
        {/* Phase Toggle */}
        <div className="flex justify-center gap-3 mb-4">
          <button
            onClick={() => setCurrentPhase('encapsulation')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentPhase === 'encapsulation'
                ? 'bg-primary-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {language === 'bn' ? 'ইনক্যাপসুলেশন (প্রেরক)' : 'Encapsulation (Sender)'}
          </button>
          <button
            onClick={() => setCurrentPhase('decapsulation')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentPhase === 'decapsulation'
                ? 'bg-primary-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {language === 'bn' ? 'ডি-ইনক্যাপসুলেশন (প্রাপক)' : 'Decapsulation (Receiver)'}
          </button>
        </div>
        
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto"
          role="img"
          aria-label={t('chapter4')}
        >
          <defs>
            <filter id="stepShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#0f172a" floodOpacity="0.1" />
            </filter>
            <marker id="arrowRight" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
              <path d="M0,0 L0,10 L10,5 Z" fill="#64748b" />
            </marker>
            <marker id="arrowLeft" markerWidth="10" markerHeight="10" refX="2" refY="5" orient="auto">
              <path d="M10,0 L10,10 L0,5 Z" fill="#64748b" />
            </marker>
          </defs>
          
          {currentPhase === 'encapsulation' ? (
            <>
              {/* Title */}
              <text x={width / 2} y={30} textAnchor="middle" fontSize="18" fontWeight="700" fill="#0f172a">
                {language === 'bn' ? 'নেটওয়ার্ক ইনক্যাপসুলেশন — ধাপে ধাপে' : 'Network Encapsulation — Step by Step'}
              </text>
              <text x={width / 2} y={50} textAnchor="middle" fontSize="11" fill="#64748b">
                {language === 'bn' ? 'অ্যাপ্লিকেশন ডেটা → TCP সেগমেন্ট → IP প্যাকেট → ইথারনেট ফ্রেম → ফিজিক্যাল বিটস' : 'Application Data → TCP Segment → IP Packet → Ethernet Frame → Physical Bits'}
              </text>
              
              {encapsulationSteps.map((step, index) => {
                const x = 40 + index * 205;
                const y = 70;
                const isExpanded = expandedStep === step.step;
                
                return (
                  <g 
                    key={step.step}
                    className={`step-box step-box-${step.step}`}
                    transform={`translate(${x}, ${y})`}
                    onClick={() => setExpandedStep(step.step === expandedStep ? null : step.step)}
                    style={{ cursor: step.layer ? 'pointer' : 'default' }}
                    filter="url(#stepShadow)"
                  >
                    {/* Step background */}
                    <rect 
                      x={0} 
                      y={0} 
                      width={195} 
                      height={isExpanded ? 450 : 280} 
                      rx={12}
                      fill="white"
                      stroke={step.layer ? step.layer.headerColor : '#64748b'}
                      strokeWidth={isExpanded ? 2 : 1.5}
                    />
                    
                    {/* Step number badge */}
                    <circle 
                      cx={15} 
                      cy={15} 
                      r={14}
                      fill={step.layer ? step.layer.headerColor : '#64748b'}
                    />
                    <text 
                      x={15} 
                      y={19} 
                      textAnchor="middle" 
                      fontSize="11" 
                      fontWeight="700" 
                      fill="white"
                    >
                      {step.step}
                    </text>
                    
                    {/* Title */}
                    <text 
                      x={97.5} 
                      y={30} 
                      textAnchor="middle" 
                      fontSize="13" 
                      fontWeight="600" 
                      fill={step.layer ? step.layer.headerColor : '#0f172a'}
                    >
                      {step.title}
                    </text>
                    
                    {/* Description */}
                    <text 
                      x={97.5} 
                      y={50} 
                      textAnchor="middle" 
                      fontSize="10" 
                      fill="#64748b"
                    >
                      {step.description}
                    </text>
                    
                    {step.layer && (
                      <>
                        {/* Header visualization */}
                        <rect 
                          className="header-visual"
                          x={15} 
                          y={65} 
                          width={165} 
                          height={40} 
                          rx={4}
                          fill={step.layer.headerColor}
                          opacity={0.2}
                          stroke={step.layer.headerColor}
                          strokeWidth={1.5}
                        />
                        <text 
                          className="header-visual"
                          x={97.5} 
                          y={88} 
                          textAnchor="middle" 
                          fontSize="10" 
                          fontWeight="600" 
                          fill={step.layer.headerColor}
                          opacity={0}
                        >
                          {step.layer.shortName} Header
                        </text>
                        
                        {/* Payload visualization */}
                        <rect 
                          className="payload-visual"
                          x={15} 
                          y={110} 
                          width={165} 
                          height={50} 
                          rx={4}
                          fill={step.layer.payloadColor}
                          opacity={0.3}
                          stroke={step.layer.headerColor}
                          strokeWidth={1}
                          strokeDasharray="4 2"
                        />
                        <text 
                          className="payload-visual"
                          x={97.5} 
                          y={138} 
                          textAnchor="middle" 
                          fontSize="9" 
                          fill={step.layer.headerColor}
                          opacity={0}
                        >
                          Payload from Layer Above
                        </text>
                        
                        {/* Data preview */}
                        <rect 
                          x={15} 
                          y={170} 
                          width={165} 
                          height={95} 
                          rx={4}
                          fill="#f8fafc"
                          stroke="#e2e8f0"
                        />
                        <text x={25} y={188} fontSize="8" fontFamily="monospace" fill="#334155">
                          {step.data}
                        </text>
                        
                        {/* Expand indicator */}
                        <text 
                          x={97.5} 
                          y={280} 
                          textAnchor="middle" 
                          fontSize="10" 
                          fill="#94a3b8"
                        >
                          {isExpanded ? '▲' : '▼'} {language === 'bn' ? 'ভಿವরণ দেখুন' : 'Click to expand'}
                        </text>
                        
                        {/* Expanded header fields */}
                        {isExpanded && (
                          <g transform="translate(15, 290)">
                            <text x={0} y={0} fontSize="10" fontWeight="600" fill={step.layer.headerColor}>
                              {language === 'bn' ? 'হেডার ফিল্ডগুলো:' : 'Header Fields:'}
                            </text>
                            {step.layer.headerFields.map((field, i) => (
                              <g key={field.name} transform={`translate(0, ${20 + i * 20})`}>
                                <rect x={0} y={-12} width={165} height={18} rx={3} fill={step.layer.headerColor} opacity={0.08} />
                                <text x={5} y={2} fontSize="8" fontWeight="500" fill={step.layer.headerColor}>{field.name}</text>
                                <text x={95} y={2} fontSize="8" fontWeight="600" fill="#64748b" textAnchor="end">{field.size}</text>
                                <text x={100} y={2} fontSize="7" fill="#94a3b8">{field.description}</text>
                              </g>
                            ))}
                            {step.layer.trailerFields && step.layer.trailerFields.map((field, i) => (
                              <g key={field.name} transform={`translate(0, ${20 + (step.layer.headerFields?.length || 0 + i) * 20})`}>
                                <rect x={0} y={-12} width={165} height={18} rx={3} fill="#ef4444" opacity={0.08} />
                                <text x={5} y={2} fontSize="8" fontWeight="500" fill="#ef4444">{field.name} (Trailer)</text>
                                <text x={95} y={2} fontSize="8" fontWeight="600" fill="#64748b" textAnchor="end">{field.size}</text>
                                <text x={100} y={2} fontSize="7" fill="#94a3b8">{field.description}</text>
                              </g>
                            ))}
                          </g>
                        )}
                      </>
                    )}
                    
                    {step.step === 1 && (
                      <rect 
                        x={15} 
                        y={65} 
                        width={165} 
                        height={100} 
                        rx={4}
                        fill="#f8fafc"
                        stroke="#e2e8f0"
                      />
                    )}
                  </g>
                );
              })}
              
              {/* Arrows between steps */}
              {encapsulationSteps.slice(0, -1).map((step) => (
                <path
                  key={step.step}
                  className={`arrow-between arrow-between-${step.step}`}
                  d={`M ${40 + step.step * 205 - 10} 180 Q ${40 + step.step * 205} 180 ${40 + step.step * 205 + 10} 180`}
                  stroke="#64748b"
                  strokeWidth={2.5}
                  fill="none"
                  markerEnd="url(#arrowRight)"
                  opacity={0}
                  transform={`scale(0, 1)`}
                />
              ))}
              
              {/* Summary at bottom */}
              <g transform="translate(40, 480)">
                <rect x={0} y={0} width={width - 80} height={60} rx={8} fill="#f0fdf4" stroke="#22c55e" strokeWidth={1} />
                <text x={20} y={20} fontSize="11" fontWeight="600" fill="#166534">
                  {language === 'bn' ? 'মূল নীতিসমূহ:' : 'Key Principles:'}
                </text>
                <text x={20} y={38} fontSize="9" fill="#166534">
                  {language === 'bn' ? '• প্রতিটি লেয়ার উপরের লেয়ারের পুরো ডেটাUnit-কে পেলোড হিসেবে বিবেচনা করে' : '• Each layer treats the entire upper-layer data unit as payload'}
                </text>
                <text x={20} y={52} fontSize="9" fill="#166534">
                  {language === 'bn' ? '• হেডার শুধু সেই লেয়ারের জন্য; নিচের লেয়াররা সেটি পেলোডের অংশ হিসেবে দেখে' : '• Headers are only for that layer; lower layers see them as part of payload'}
                </text>
              </g>
            </>
          ) : (
            <>
              {/* Decapsulation Title */}
              <text x={width / 2} y={30} textAnchor="middle" fontSize="18" fontWeight="700" fill="#0f172a">
                {language === 'bn' ? 'নেটওয়ার্ক ডি-ইনক্যাপসুলেশন — ধাপে ধাপে' : 'Network Decapsulation — Step by Step'}
              </text>
              <text x={width / 2} y={50} textAnchor="middle" fontSize="11" fill="#64748b">
                {language === 'bn' ? 'ফিজিক্যাল বিটস → ইথারনেট ফ্রেম → IP প্যাকেট → TCP সেগমেন্ট → অ্যাপ্লিকেশন ডেটা' : 'Physical Bits → Ethernet Frame → IP Packet → TCP Segment → Application Data'}
              </text>
              
              {decapsulationSteps.map((step, index) => {
                const x = 40 + index * 205;
                const y = 80;
                
                return (
                  <g 
                    key={step.step}
                    className={`step-box step-box-${step.step}`}
                    transform={`translate(${x}, ${y})`}
                    filter="url(#stepShadow)"
                  >
                    <rect 
                      x={0} 
                      y={0} 
                      width={195} 
                      height={280} 
                      rx={12}
                      fill="white"
                      stroke="#2563eb"
                      strokeWidth={1.5}
                    />
                    
                    <circle 
                      cx={15} 
                      cy={15} 
                      r={14}
                      fill="#2563eb"
                    />
                    <text 
                      x={15} 
                      y={19} 
                      textAnchor="middle" 
                      fontSize="11" 
                      fontWeight="700" 
                      fill="white"
                    >
                      {step.step}
                    </text>
                    
                    <text 
                      x={97.5} 
                      y={30} 
                      textAnchor="middle" 
                      fontSize="13" 
                      fontWeight="600" 
                      fill="#2563eb"
                    >
                      {step.title}
                    </text>
                    
                    <text 
                      x={97.5} 
                      y={50} 
                      textAnchor="middle" 
                      fontSize="10" 
                      fill="#64748b"
                    >
                      {step.description}
                    </text>
                    
                    <text 
                      x={97.5} 
                      y={80} 
                      textAnchor="middle" 
                      fontSize="10" 
                      fontWeight="500" 
                      fill="#ef4444"
                    >
                      {language === 'bn' ? 'কার্যক্রম:' : 'Action:'}
                    </text>
                    <text 
                      x={97.5} 
                      y={100} 
                      textAnchor="middle" 
                      fontSize="9" 
                      fill="#334155"
                    >
                      {step.action}
                    </text>
                    
                    {/* Visual: peeling layers */}
                    <g transform="translate(15, 120)">
                      {[4, 3, 2, 1].map((layerNum, i) => (
                        <g key={layerNum} opacity={index >= i ? 1 : 0.3}>
                          <rect 
                            x={0} 
                            y={i * 35} 
                            width={165} 
                            height={30} 
                            rx={4}
                            fill={['#1e293b', '#374151', '#78350f', '#166534'][i] + '20'}
                            stroke={['#1e293b', '#374151', '#78350f', '#166534'][i]}
                            strokeWidth={index === i ? 2 : 1}
                            strokeDasharray={index === i ? 'none' : '4 2'}
                          />
                          <text 
                            x={82.5} 
                            y={i * 35 + 18} 
                            textAnchor="middle" 
                            fontSize="10" 
                            fontWeight={index === i ? '600' : '400'}
                            fill={['#1e293b', '#374151', '#78350f', '#166534'][i]}
                          >
                            {index === i ? '✓ ' : ''}{['Physical', 'Ethernet', 'IP', 'TCP'][i]}
                          </text>
                        </g>
                      ))}
                    </g>
                  </g>
                );
              })}
              
              {/* Arrows between decapsulation steps */}
              {decapsulationSteps.slice(0, -1).map((step) => (
                <path
                  key={step.step}
                  className={`arrow-between arrow-between-${step.step}`}
                  d={`M ${40 + step.step * 205 - 10} 180 Q ${40 + step.step * 205} 180 ${40 + step.step * 205 + 10} 180`}
                  stroke="#64748b"
                  strokeWidth={2.5}
                  fill="none"
                  markerEnd="url(#arrowRight)"
                  opacity={0}
                  transform={`scale(0, 1)`}
                />
              ))}
              
              {/* Summary at bottom */}
              <g transform="translate(40, 480)">
                <rect x={0} y={0} width={width - 80} height={60} rx={8} fill="#fef3c7" stroke="#f59e0b" strokeWidth={1} />
                <text x={20} y={20} fontSize="11" fontWeight="600" fill="#78350f">
                  {language === 'bn' ? 'মূল নীতিসমূহ:' : 'Key Principles:'}
                </text>
                <text x={20} y={38} fontSize="9" fill="#78350f">
                  {language === 'bn' ? '• প্রাপক সাইডে লেয়ারগুলো বিপরীত ক্রমে প্রক্রিয়া করে' : '• Receiver processes layers in reverse order'}
                </text>
                <text x={20} y={52} fontSize="9" fill="#78350f">
                  {language === 'bn' ? '• প্রতিটি লেয়ার তার নিজস্ব হেডার যাচাই করে এবং সরিয়ে দেয়' : '• Each layer validates and strips its own header'}
                </text>
              </g>
            </>
          )}
        </svg>
      </div>
    </div>
  );
});

interface Chapter4Props extends DiagramProps {}
export default Chapter4;
