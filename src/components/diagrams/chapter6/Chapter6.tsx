import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { DiagramProps } from '../../../types';

export const Chapter6 = React.memo(function Chapter6({ 
  language, 
  animationState, 
  onAnimationComplete 
}: Chapter6Props) {
  const { t } = useTranslation();
  const svgRef = useRef<SVGSVGElement>(null);
  const animationRef = useRef<gsap.core.Timeline | null>(null);
  
  const macAddress = '00:1A:2B:3C:4D:5E';
  const bytes = macAddress.split(':');
  
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
        gsap.set('.mac-part', { opacity: 0, scale: 0.8 });
        gsap.set('.bit-row', { opacity: 0, x: -20 });
        gsap.set('.explanation-box', { opacity: 0, y: 20 });
        gsap.set('.mac-label', { opacity: 0 });
      } else {
        // Not playing - show everything immediately
        gsap.set('.mac-part', { opacity: 1, scale: 1 });
        gsap.set('.bit-row', { opacity: 1, x: 0 });
        gsap.set('.explanation-box', { opacity: 1, y: 0 });
        gsap.set('.mac-label', { opacity: 1 });
      }
      
      if (animationState.isPlaying) {
        // Initial setup
        gsap.set('.mac-part', { opacity: 0, scale: 0.8 });
        gsap.set('.bit-row', { opacity: 0, x: -20 });
        gsap.set('.explanation-box', { opacity: 0, y: 20 });
        gsap.set('.mac-label', { opacity: 0 });
        
        // MAC address appears
        timeline.to('.mac-part', { 
          opacity: 1, 
          scale: 1, 
          duration: 0.4, 
          stagger: 0.1,
          ease: 'back.out(1.5)'
        });
        
        // Labels appear
        timeline.to('.mac-label', { 
          opacity: 1, 
          y: 0, 
          duration: 0.3, 
          stagger: 0.1 
        }, '-=0.2');
        
        // Binary expansion
        timeline.to('.bit-row', { 
          opacity: 1, 
          x: 0, 
          duration: 0.3, 
          stagger: 0.05
        }, '+=0.5');
        
        // Explanations
        timeline.to('.explanation-box', { 
          opacity: 1, 
          y: 0, 
          duration: 0.4, 
          stagger: 0.15
        }, '+=0.3');
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
  
  const byteToBinary = (hex: string) => {
    return parseInt(hex, 16).toString(2).padStart(8, '0');
  };
  
  const width = 900;
  const height = 500;
  
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[900px]">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto"
          role="img"
          aria-label={t('chapter6')}
        >
          <defs>
            <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#0f172a" floodOpacity="0.1" />
            </filter>
            <linearGradient id="macGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f8fafc" />
            </linearGradient>
          </defs>
          
          {/* Title */}
          <text x={width / 2} y={25} textAnchor="middle" fontSize="18" fontWeight="700" fill="#0f172a">
            {language === 'bn' ? 'MAC ঠিকানা — নেটওয়ার্ক ইন্টারফেস চিহ্নিতকরণ' : 'MAC Addresses — Identifying Network Interfaces'}
          </text>
          
          {/* Main MAC Address Display */}
          <g transform={`translate(${width / 2 - 280}, 60)`} filter="url(#cardShadow)">
            <rect x={0} y={0} width={560} height={100} rx={12} fill="url(#macGradient)" stroke="#2563eb" strokeWidth={2} />
            
            {/* MAC Address bytes */}
            <g transform="translate(20, 30)">
              {bytes.map((byte, i) => (
                <g key={i} className="mac-part" transform={`translate(${i * 90}, 0)`}>
                  <rect x={0} y={0} width={70} height={40} rx={6} fill={i < 3 ? '#dbeafe' : '#fef3c7'} stroke={i < 3 ? '#2563eb' : '#f59e0b'} strokeWidth={1.5} />
                  <text x={35} y={24} textAnchor="middle" fontSize="16" fontWeight="700" fontFamily="monospace" fill={i < 3 ? '#1d4ed8' : '#d97706'}>
                    {byte}
                  </text>
                  {i < 5 && (
                    <text x={72} y={24} textAnchor="middle" fontSize="16" fontWeight="700" fill="#94a3b8">:</text>
                  )}
                </g>
              ))}
            </g>
            
            {/* Labels */}
            <g transform="translate(20, 75)">
              <text x={100} y={0} textAnchor="middle" fontSize="11" fontWeight="600" fill="#2563eb" className="mac-label" opacity={0}>
                {language === 'bn' ? 'OUI (Organizationally Unique Identifier)' : 'OUI (Organizationally Unique Identifier)'}
              </text>
              <text x={420} y={0} textAnchor="middle" fontSize="11" fontWeight="600" fill="#f59e0b" className="mac-label" opacity={0}>
                {language === 'bn' ? 'NIC-নির্দিষ্ট部分 (Device Specific)' : 'NIC-Specific (Device Identifier)'}
              </text>
            </g>
          </g>
          
          {/* Binary Representation */}
          <g transform="translate(40, 180)">
            <text x={0} y={0} fontSize="13" fontWeight="600" fill="#0f172a">
              {language === 'bn' ? 'বাইনারি প্রতিনিধিত্ব (48 বিট)' : 'Binary Representation (48 bits)'}
            </text>
            
            <g className="bit-row" transform="translate(0, 25)" opacity={0} x={-20}>
              {bytes.map((byte, byteIndex) => (
                <g key={byteIndex} transform={`translate(${byteIndex * 100}, 0)`}>
                  <text x={0} y={-5} fontSize="10" fontWeight="500" fill="#64748b" fontFamily="monospace">
                    {byte}:
                  </text>
                  <g transform="translate(0, 10)">
                    {byteToBinary(byte).split('').map((bit, bitIndex) => (
                      <g key={bitIndex} style={{ cursor: 'pointer' }}>
                        <rect 
                          x={bitIndex * 18} 
                          y={0} 
                          width={16} 
                          height={22} 
                          rx={2}
                          fill={bit === '1' ? '#2563eb' : '#e2e8f0'}
                          stroke={bit === '1' ? '#1d4ed8' : '#cbd5e1'}
                          strokeWidth={1}
                        />
                        <text x={bitIndex * 18 + 8} y={15} textAnchor="middle" fontSize="11" fontWeight="600" fontFamily="monospace" fill={bit === '1' ? 'white' : '#334155'}>
                          {bit}
                        </text>
                      </g>
                    ))}
                  </g>
                </g>
              ))}
            </g>
          </g>
          
          {/* Explanations */}
          <g className="explanation-box" transform="translate(40, 320)" opacity={0} y={20}>
            <rect x={0} y={0} width={400} height={150} rx={8} fill="#f0fdf4" stroke="#22c55e" strokeWidth={1} />
            <text x={20} y={22} fontSize="12" fontWeight="600" fill="#166534">
              {language === 'bn' ? 'প্রথম ৩ বাইট (24 বিট): OUI' : 'First 3 bytes (24 bits): OUI'}
            </text>
            <text x={20} y={42} fontSize="10" fill="#166534">
              {language === 'bn' ? `IEEE দ্বারা আ Rokট Công tyর জন্য বরাদ্দ করা হয়েছে (উদাহরণ: 00:1A:2B)` : `Assigned by IEEE to manufacturer (e.g., 00:1A:2B)`}
            </text>
            <text x={20} y={62} fontSize="12" fontWeight="600" fill="#d97706">
              {language === 'bn' ? 'প بعده ৩ বাইট (24 বিট): NIC-নির্দিষ্ট' : 'Last 3 bytes (24 bits): NIC-specific'}
            </text>
            <text x={20} y={82} fontSize="10" fill="#d97706">
              {language === 'bn' ? `হার্ডওয়্যার নির্মাতা দ্বারা অনন્યভাবে বরাদ্দ করা হয়` : `Uniquely assigned by hardware manufacturer`}
            </text>
            <text x={20} y={102} fontSize="10" fontWeight="600" fill="#2563eb">
              {language === 'bn' ? 'বিশেষ বিটস:' : 'Special Bits:'}
            </text>
            <text x={20} y={120} fontSize="9" fill="#2563eb">
              {language === 'bn' ? 'বিট ০ (LSB প্রথম বাইট): ০ = ইউনিকাস্ট, ১ = মাল্টিকাস্ট/ব্রডকাস্ট' : 'Bit 0 (LSB of 1st byte): 0 = Unicast, 1 = Multicast/Broadcast'}
            </text>
            <text x={20} y={136} fontSize="9" fill="#2563eb">
              {language === 'bn' ? 'বিট ১ (দ্বিতীয় বাইট): ০ = গ্লোবাল (OUI), ১ = লোকালি প্রশাসিত' : 'Bit 1 (2nd byte): 0 = Global (OUI), 1 = Locally Administered'}
            </text>
          </g>
          
          <g className="explanation-box" transform="translate(460, 320)" opacity={0} y={20}>
            <rect x={0} y={0} width={400} height={150} rx={8} fill="#eff6ff" stroke="#2563eb" strokeWidth={1} />
            <text x={20} y={22} fontSize="12" fontWeight="600" fill="#1d4ed8">
              {language === 'bn' ? 'MAC vs IP ঠিকানা' : 'MAC vs IP Address'}
            </text>
            <g transform="translate(20, 35)">
              <text x={0} y={0} fontSize="10" fontWeight="600" fill="#334155">{language === 'bn' ? 'MAC ঠিকানা (Layer 2):' : 'MAC Address (Layer 2):'}</text>
              <text x={0} y={18} fontSize="9" fill="#64748b">• 48-বিট হার্ডওয়্যার ঠিকানা</text>
              <text x={0} y={32} fontSize="9" fill="#64748b">• লোকাল লিঙ্ক-ওনلی</text>
              <text x={0} y={46} fontSize="9" fill="#64748b">• সাধারণত স্থায়ী (BIA)</text>
              <text x={0} y={60} fontSize="9" fill="#64748b">• FRAMে.src/dst হিসেবে থাকে</text>
            </g>
            <g transform="translate(20, 95)">
              <text x={0} y={0} fontSize="10" fontWeight="600" fill="#334155">{language === 'bn' ? 'IP ঠিকানা (Layer 3):' : 'IP Address (Layer 3):'}</text>
              <text x={0} y={18} fontSize="9" fill="#64748b">• 32-বিট (IPv4) / 128-বিট (IPv6)</text>
              <text x={0} y={32} fontSize="9" fill="#64748b">• গ্লোবাল রাউটিং-এ ব্যবহৃত</text>
              <text x={0} y={46} fontSize="9" fill="#64748b">• DHCP/স্থাটিক কনফিগারেবল</text>
              <text x={0} y={60} fontSize="9" fill="#64748b">• IP প্যাকেটে src/dst হিসেবে থাকে</text>
            </g>
          </g>
          
          {/* Frame in context */}
          <g transform="translate(40, 490)">
            <text x={0} y={0} fontSize="11" fontWeight="600" fill="#64748b">
              {language === 'bn' ? 'ইথারনেট ফ্রেমে ব্যবহার:' : 'Used in Ethernet Frame:'}
            </text>
            <g transform="translate(0, 18)">
              <rect x={0} y={0} width={140} height={25} rx={3} fill="#2563eb" opacity={0.2} stroke="#2563eb" />
              <text x={70} y={15} textAnchor="middle" fontSize="9" fontWeight="600" fill="#2563eb">Dst MAC</text>
              <rect x={150} y={0} width={140} height={25} rx={3} fill="#2563eb" opacity={0.2} stroke="#2563eb" />
              <text x={220} y={15} textAnchor="middle" fontSize="9" fontWeight="600" fill="#2563eb">Src MAC</text>
              <text x={310} y={15} fontSize="9" fill="#94a3b8">← {macAddress}</text>
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
});

interface Chapter6Props extends DiagramProps {}
export default Chapter6;
