import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { DiagramProps } from '../../../types';

interface Chapter1Props extends DiagramProps {}

export const Chapter1 = React.memo(function Chapter1({ 
  language, 
  animationState, 
  onAnimationComplete 
}: Chapter1Props) {
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
      });
      
      animationRef.current = timeline;
      
      // Handle initial state based on playing status
      if (animationState.isPlaying) {
        // Animation will play - set initial hidden state
        gsap.set(['.packet', '.packet-response', '.arrow', '.label-step'], { opacity: 0 });
        gsap.set('.device', { scale: 0.9, opacity: 0 });
        gsap.set('.device-label', { opacity: 0 });
        gsap.set('.step-labels text', { opacity: 0 });
        gsap.set('.protocol-stack', { opacity: 0 });
      } else {
        // Not playing - show everything immediately
        gsap.set(['.packet', '.arrow', '.label-step', '.device', '.device-label', '.step-labels text', '.protocol-stack'], { opacity: 1, scale: 1 });
        gsap.set('.connection-line', { strokeDashoffset: 0 });
      }
      
      if (animationState.isPlaying) {
        // Initial setup - all elements hidden
        gsap.set(['.packet', '.arrow', '.label-step'], { opacity: 0 });
        gsap.set('.device', { scale: 0.9, opacity: 0 });
        gsap.set('.device-label', { opacity: 0 });
        
        // Animate devices appearing
        timeline.to('.device', { 
          scale: 1, 
          opacity: 1, 
          duration: 0.5, 
          stagger: 0.15,
          ease: 'back.out(1.5)'
        });
        
        // Show labels
        timeline.to('.device-label', { 
          opacity: 1, 
          y: 0, 
          duration: 0.3, 
          stagger: 0.1 
        }, '-=0.3');
        
        // Show connection lines
        timeline.to('.connection-line', { 
          strokeDashoffset: 0, 
          duration: 0.8, 
          stagger: 0.1,
          ease: 'power2.out'
        }, '-=0.2');
        
        // Step 1: Client sends request
        timeline.to('.step-1', { opacity: 1, duration: 0.3 }, '+=0.5');
        timeline.to('.packet-request', { 
          opacity: 1, 
          motionPath: {
            path: '#path-request',
            align: '#path-request',
            autoRotate: true,
            start: 0,
            end: 1,
          },
          duration: 2,
          ease: 'power1.inOut'
        }, '-=0.1');
        timeline.to('.step-1', { opacity: 0.5, duration: 0.2 }, '+=0.3');
        
        // Step 2: Through switch
        timeline.to('.step-2', { opacity: 1, duration: 0.3 });
        timeline.to('.packet-request', { 
          motionPath: {
            path: '#path-switch',
            align: '#path-switch',
            autoRotate: true,
            start: 0,
            end: 1,
          },
          duration: 1.5,
          ease: 'power1.inOut'
        }, '-=0.1');
        timeline.to('.step-2', { opacity: 0.5, duration: 0.2 }, '+=0.3');
        
        // Step 3: Through router to internet
        timeline.to('.step-3', { opacity: 1, duration: 0.3 });
        timeline.to('.packet-request', { 
          motionPath: {
            path: '#path-router',
            align: '#path-router',
            autoRotate: true,
            start: 0,
            end: 1,
          },
          duration: 2,
          ease: 'power1.inOut'
        }, '-=0.1');
        timeline.to('.step-3', { opacity: 0.5, duration: 0.2 }, '+=0.3');
        
        // Step 4: Through destination network to server
        timeline.to('.step-4', { opacity: 1, duration: 0.3 });
        timeline.to('.packet-request', { 
          motionPath: {
            path: '#path-dest',
            align: '#path-dest',
            autoRotate: true,
            start: 0,
            end: 1,
          },
          duration: 2,
          ease: 'power1.inOut'
        }, '-=0.1');
        timeline.to('.step-4', { opacity: 0.5, duration: 0.2 }, '+=0.3');
        
        // Step 5: Server responds
        timeline.to('.step-5', { opacity: 1, duration: 0.3 }, '+=0.5');
        timeline.to('.packet-response', { 
          opacity: 1,
          motionPath: {
            path: '#path-response',
            align: '#path-response',
            autoRotate: true,
            start: 0,
            end: 1,
          },
          duration: 3,
          ease: 'power1.inOut'
        }, '-=0.1');
        timeline.to('.step-5', { opacity: 0.5, duration: 0.2 }, '+=0.3');
        
        // Final: All steps complete
        timeline.to('.step-label', { opacity: 1, duration: 0.3 }, '+=0.5');
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
  const height = 500;
  
  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full max-w-[900px]"
        role="img"
        aria-label={t('chapter1')}
      >
        <defs>
          {/* Paths for packet movement */}
          <path id="path-request" d="M 150 250 Q 250 250 350 250" fill="none" stroke="none" />
          <path id="path-switch" d="M 350 250 Q 425 250 500 250" fill="none" stroke="none" />
          <path id="path-router" d="M 500 250 Q 575 200 650 150 Q 725 100 800 150" fill="none" stroke="none" />
          <path id="path-dest" d="M 800 150 Q 825 200 850 250" fill="none" stroke="none" />
          <path id="path-response" d="M 850 250 Q 825 300 800 350 Q 725 400 650 350 Q 575 300 500 350 Q 425 350 350 350 Q 250 350 150 350" fill="none" stroke="none" />
          
          {/* Gradients */}
          <linearGradient id="deviceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f1f5f9" />
          </linearGradient>
          <linearGradient id="serverGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#dcfce7" />
            <stop offset="100%" stopColor="#bbf7d0" />
          </linearGradient>
          <linearGradient id="clientGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#dbeafe" />
            <stop offset="100%" stopColor="#bfdbfe" />
          </linearGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#0f172a" floodOpacity="0.1" />
          </filter>
        </defs>
        
        {/* Background grid */}
        <g className="grid" stroke="#e2e8f0" strokeWidth="0.5">
          <rect x="0" y="0" width={width} height={height} fill="url(#gridPattern)" />
        </g>
        <defs>
          <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f1f5f9" strokeWidth="1" />
          </pattern>
        </defs>
        
        {/* LAN Labels */}
        <text x="150" y="80" className="device-label" textAnchor="middle" fontSize="12" fontWeight="600" fill="#475569">
          {language === 'bn' ? 'লোকাল নেটওয়ার্ক (LAN)' : 'Local Network (LAN)'}
        </text>
        <text x="850" y="80" className="device-label" textAnchor="middle" fontSize="12" fontWeight="600" fill="#475569">
          {language === 'bn' ? 'গন্তব্য নেটওয়ার্ক' : 'Destination Network'}
        </text>
        <text x="650" y="60" className="device-label" textAnchor="middle" fontSize="11" fontWeight="500" fill="#64748b">
          {language === 'bn' ? 'ইন্টারনেট' : 'Internet'}
        </text>
        
        {/* Connection lines */}
        <g className="connection-lines" stroke="#cbd5e1" strokeWidth="2" fill="none" strokeDasharray="8 4">
          <path className="connection-line" d="M 150 250 Q 250 250 350 250" strokeDashoffset="200" />
          <path className="connection-line" d="M 350 250 Q 425 250 500 250" strokeDashoffset="200" />
          <path className="connection-line" d="M 500 250 Q 575 200 650 150 Q 725 100 800 150" strokeDashoffset="400" />
          <path className="connection-line" d="M 800 150 Q 825 200 850 250" strokeDashoffset="100" />
          {/* Return path */}
          <path className="connection-line" d="M 850 250 Q 825 300 800 350 Q 725 400 650 350 Q 575 300 500 350 Q 425 350 350 350 Q 250 350 150 350" strokeDashoffset="800" stroke="#94a3b8" strokeWidth="1.5" />
        </g>
        
        {/* Devices */}
        {/* Client Computer */}
        <g className="device" transform="translate(50, 200)" filter="url(#shadow)">
          <rect x="0" y="0" width="100" height="100" rx="12" fill="url(#clientGradient)" stroke="#2563eb" strokeWidth="2" />
          <rect x="20" y="15" width="60" height="50" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1" />
          <rect x="35" y="70" width="30" height="4" rx="2" fill="#334155" />
          <circle cx="80" cy="25" r="6" fill="#22c55e" opacity="0.8" />
        </g>
        <text x="100" y="320" className="device-label" textAnchor="middle" fontSize="13" fontWeight="600" fill="#0f172a">
          {language === 'bn' ? 'ক্লায়েন্ট কম্পিউটার' : 'Client Computer'}
        </text>
        <text x="100" y="340" className="device-label" textAnchor="middle" fontSize="10" fill="#64748b">
          192.168.1.10
        </text>
        
        {/* Switch */}
        <g className="device" transform="translate(325, 200)" filter="url(#shadow)">
          <rect x="0" y="0" width="50" height="100" rx="8" fill="#f8fafc" stroke="#64748b" strokeWidth="2" />
          <g stroke="#2563eb" strokeWidth="2">
            <line x1="10" y1="20" x2="40" y2="20" />
            <line x1="10" y1="50" x2="40" y2="50" stroke="#22c55e" />
            <line x1="10" y1="80" x2="40" y2="80" />
          </g>
          <circle cx="25" cy="50" r="3" fill="#22c55e" opacity="0.8" />
        </g>
        <text x="350" y="320" className="device-label" textAnchor="middle" fontSize="13" fontWeight="600" fill="#0f172a">
          {language === 'bn' ? 'ইথারনেট স্যুইচ' : 'Ethernet Switch'}
        </text>
        
        {/* Router */}
        <g className="device" transform="translate(475, 200)" filter="url(#shadow)">
          <polygon points="25,0 50,15 50,85 25,100 0,85 0,15" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" />
          <circle cx="25" cy="50" r="12" fill="#fffbeb" stroke="#f59e0b" strokeWidth="1.5" />
          <path d="M25 35 L25 50 L35 55" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>
        <text x="500" y="320" className="device-label" textAnchor="middle" fontSize="13" fontWeight="600" fill="#0f172a">
          {language === 'bn' ? 'রাউটার' : 'Router'}
        </text>
        <text x="500" y="340" className="device-label" textAnchor="middle" fontSize="10" fill="#64748b">
          Gateway: 192.168.1.1
        </text>
        
        {/* Internet Cloud */}
        <g className="device" transform="translate(600, 80)" filter="url(#shadow)" opacity="0.7">
          <ellipse cx="50" cy="35" rx="55" ry="30" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="5 3" />
          <text x="50" y="38" textAnchor="middle" fontSize="14" fontWeight="700" fill="#f59e0b">
            ☁
          </text>
        </g>
        
        {/* Destination Network Router */}
        <g className="device" transform="translate(775, 200)" filter="url(#shadow)">
          <polygon points="25,0 50,15 50,85 25,100 0,85 0,15" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" />
          <circle cx="25" cy="50" r="12" fill="#fffbeb" stroke="#f59e0b" strokeWidth="1.5" />
          <path d="M25 35 L25 50 L35 55" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>
        <text x="800" y="320" className="device-label" textAnchor="middle" fontSize="13" fontWeight="600" fill="#0f172a">
          {language === 'bn' ? 'গন্তব্য রাউটার' : 'Destination Router'}
        </text>
        
        {/* Server */}
        <g className="device" transform="translate(825, 200)" filter="url(#shadow)">
          <rect x="0" y="0" width="100" height="100" rx="12" fill="url(#serverGradient)" stroke="#22c55e" strokeWidth="2" />
          <rect x="15" y="15" width="70" height="25" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1" />
          <rect x="10" y="50" width="35" height="35" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1" />
          <rect x="55" y="50" width="35" height="35" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1" />
          <circle cx="85" cy="25" r="6" fill="#22c55e" opacity="0.8" />
        </g>
        <text x="875" y="320" className="device-label" textAnchor="middle" fontSize="13" fontWeight="600" fill="#0f172a">
          {language === 'bn' ? 'সার্ভার' : 'Server'}
        </text>
        <text x="875" y="340" className="device-label" textAnchor="middle" fontSize="10" fill="#64748b">
          203.0.113.10
        </text>
        
        {/* Packets */}
        {/* Request packet */}
        <g className="packet packet-request" transform="translate(-20, -15)">
          <ellipse cx="0" cy="0" rx="14" ry="10" fill="#2563eb" stroke="#1d4ed8" strokeWidth="1.5" opacity="0.9" filter="url(#shadow)" />
          <text x="0" y="3" textAnchor="middle" fontSize="8" fontWeight="700" fill="white">REQ</text>
          <ellipse cx="0" cy="0" rx="10" ry="6" fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3 2" opacity="0.6" />
        </g>
        
        {/* Response packet */}
        <g className="packet packet-response" transform="translate(-20, -15)">
          <ellipse cx="0" cy="0" rx="14" ry="10" fill="#22c55e" stroke="#16a34a" strokeWidth="1.5" opacity="0.9" filter="url(#shadow)" />
          <text x="0" y="3" textAnchor="middle" fontSize="8" fontWeight="700" fill="white">RES</text>
          <ellipse cx="0" cy="0" rx="10" ry="6" fill="none" stroke="#4ade80" strokeWidth="1" strokeDasharray="3 2" opacity="0.6" />
        </g>
        
        {/* Step labels */}
        <g className="step-labels" fontSize="11" fontWeight="500">
          <text x="100" y="160" className="step-label step-1" textAnchor="middle" fill="#2563eb">
            ① {language === 'bn' ? 'ক্লায়েন্ট অনুরোধ পাঠায়' : 'Client sends request'}
          </text>
          <text x="350" y="160" className="step-label step-2" textAnchor="middle" fill="#64748b">
            ② {language === 'bn' ? 'স্যুইচ ফ্রেম ফরওয়ার্ড করে' : 'Switch forwards frame'}
          </text>
          <text x="500" y="160" className="step-label step-3" textAnchor="middle" fill="#f59e0b">
            ③ {language === 'bn' ? 'রাউটার ইন্টারনেটের মাধ্যমে রুট করে' : 'Router routes via Internet'}
          </text>
          <text x="800" y="160" className="step-label step-4" textAnchor="middle" fill="#64748b">
            ④ {language === 'bn' ? 'গন্তব্য নেটওয়ার্কে পৌঁছায়' : 'Reaches destination network'}
          </text>
          <text x="875" y="160" className="step-label step-5" textAnchor="middle" fill="#22c55e">
            ⑤ {language === 'bn' ? 'সার্ভার প্রতিক্রিয়া পাঠায়' : 'Server sends response'}
          </text>
        </g>
        
        {/* Protocol stack indicator */}
        <g transform="translate(50, 370)" className="protocol-stack">
          <rect x="0" y="0" width="800" height="60" rx="8" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
          <text x="10" y="20" fontSize="10" fontWeight="600" fill="#475569">
            {language === 'bn' ? 'প্রোটোকল স্ট্যাক:' : 'Protocol Stack:'}
          </text>
          <g fontSize="9" fill="#334155">
            <g transform="translate(120, 0)">
              <rect x="0" y="5" width="100" height="22" rx="4" fill="#dbeafe" stroke="#2563eb" strokeWidth="1" />
              <text x="50" y="20" textAnchor="middle" fontSize="8" fontWeight="500" fill="#1d4ed8">Application (HTTP)</text>
            </g>
            <g transform="translate(240, 0)">
              <rect x="0" y="5" width="100" height="22" rx="4" fill="#dbeafe" stroke="#2563eb" strokeWidth="1" />
              <text x="50" y="20" textAnchor="middle" fontSize="8" fontWeight="500" fill="#1d4ed8">Transport (TCP)</text>
            </g>
            <g transform="translate(360, 0)">
              <rect x="0" y="5" width="100" height="22" rx="4" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1" />
              <text x="50" y="20" textAnchor="middle" fontSize="8" fontWeight="500" fill="#d97706">Internet (IP)</text>
            </g>
            <g transform="translate(480, 0)">
              <rect x="0" y="5" width="100" height="22" rx="4" fill="#e0e7ff" stroke="#6366f1" strokeWidth="1" />
              <text x="50" y="20" textAnchor="middle" fontSize="8" fontWeight="500" fill="#4f46e5">Link (Ethernet)</text>
            </g>
            <g transform="translate(600, 0)">
              <rect x="0" y="5" width="100" height="22" rx="4" fill="#f1f5f9" stroke="#64748b" strokeWidth="1" />
              <text x="50" y="20" textAnchor="middle" fontSize="8" fontWeight="500" fill="#475569">Physical</text>
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
});
export default Chapter1;
