import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, Language, Module } from '../types';

interface AppStore extends AppState {
  modules: Module[];
  setLanguage: (lang: Language) => void;
  setCurrentChapter: (chapterId: number) => void;
  setCurrentModule: (moduleId: number) => void;
  toggleFullscreen: () => void;
  setFullscreen: (value: boolean) => void;
  setAnimationState: (state: Partial<AppState['animationState']>) => void;
  togglePresenterMode: () => void;
  setPresenterMode: (value: boolean) => void;
  setReducedMotion: (value: boolean) => void;
  markChapterComplete: (chapterId: number) => void;
  nextChapter: () => void;
  previousChapter: () => void;
  getTotalChapters: () => number;
  getCompletedCount: () => number;
  getProgress: () => number;
}

const modules: Module[] = [
  {
    id: 1,
    title: 'Networking Foundations',
    subtitle: 'Core concepts of how networks communicate',
    chapters: [
      { id: 1, moduleId: 1, moduleTitle: 'Networking Foundations', title: 'How Computer Networks Communicate', description: 'An animated overview of two computers communicating through a network', component: 'Chapter1', duration: 30 },
      { id: 2, moduleId: 1, moduleTitle: 'Networking Foundations', title: 'The ISO/OSI Network Model', description: 'Seven-layer animated diagram showing encapsulation and decapsulation', component: 'Chapter2', duration: 45 },
      { id: 3, moduleId: 1, moduleTitle: 'Networking Foundations', title: 'The TCP/IP Model and Its Layers', description: 'Four-layer TCP/IP model with interactive OSI mapping', component: 'Chapter3', duration: 35 },
      { id: 4, moduleId: 1, moduleTitle: 'Networking Foundations', title: 'Network Encapsulation and Decapsulation', description: 'Technical demonstration of packet wrapping and unwrapping', component: 'Chapter4', duration: 40 },
    ],
  },
  {
    id: 2,
    title: 'Ethernet, MAC, IP and Network Access',
    subtitle: 'Local network communication and addressing',
    chapters: [
      { id: 5, moduleId: 2, moduleTitle: 'Ethernet, MAC, IP and Network Access', title: 'Ethernet — Communication Inside a Local Network', description: 'Animated LAN diagram with switch forwarding and frame anatomy', component: 'Chapter5', duration: 40 },
      { id: 6, moduleId: 2, moduleTitle: 'Ethernet, MAC, IP and Network Access', title: 'MAC Addresses — Identifying Network Interfaces', description: 'Close-up visual of network interface with MAC address breakdown', component: 'Chapter6', duration: 25 },
      { id: 7, moduleId: 2, moduleTitle: 'Ethernet, MAC, IP and Network Access', title: 'ARP — Finding a Device\'s MAC Address', description: 'Complete animated ARP request and reply sequence', component: 'Chapter7', duration: 35 },
      { id: 8, moduleId: 2, moduleTitle: 'Ethernet, MAC, IP and Network Access', title: 'IP Addressing — Identifying Devices Across Networks', description: 'Visual comparison of IPv4 and IPv6 addressing', component: 'Chapter8', duration: 30 },
      { id: 9, moduleId: 2, moduleTitle: 'Ethernet, MAC, IP and Network Access', title: 'Public and Private IP Addressing', description: 'Home network diagram with NAT demonstration', component: 'Chapter9', duration: 30 },
      { id: 10, moduleId: 2, moduleTitle: 'Ethernet, MAC, IP and Network Access', title: 'Subnetting — Dividing Networks into Smaller Networks', description: 'Interactive subnet calculator with visual network division', component: 'Chapter10', duration: 45 },
      { id: 11, moduleId: 2, moduleTitle: 'Ethernet, MAC, IP and Network Access', title: 'IP Routing — How Packets Find Their Destination', description: 'Multi-router network with routing table visualization', component: 'Chapter11', duration: 40 },
      { id: 12, moduleId: 2, moduleTitle: 'Ethernet, MAC, IP and Network Access', title: 'NAT — Connecting Private Networks to the Internet', description: 'Animated NAT translation table with port mapping', component: 'Chapter12', duration: 35 },
      { id: 13, moduleId: 2, moduleTitle: 'Ethernet, MAC, IP and Network Access', title: 'DHCP — How Devices Receive Network Configuration', description: 'Animated DORA sequence with message details', component: 'Chapter13', duration: 35 },
    ],
  },
  {
    id: 3,
    title: 'Transport Protocols and Ports',
    subtitle: 'TCP, UDP, and service identification',
    chapters: [
      { id: 14, moduleId: 3, moduleTitle: 'Transport Protocols and Ports', title: 'TCP — Reliable, Ordered Communication', description: 'Animation showing segments, sequence numbers, and retransmission', component: 'Chapter14', duration: 40 },
      { id: 15, moduleId: 3, moduleTitle: 'Transport Protocols and Ports', title: 'TCP Three-Way Handshake — SYN, SYN-ACK, ACK', description: 'Dedicated handshake animation with sequence numbers', component: 'Chapter15', duration: 30 },
      { id: 16, moduleId: 3, moduleTitle: 'Transport Protocols and Ports', title: 'UDP — Fast, Connectionless Datagram Communication', description: 'Visual comparison of TCP vs UDP behavior', component: 'Chapter16', duration: 25 },
      { id: 17, moduleId: 3, moduleTitle: 'Transport Protocols and Ports', title: 'Ports — Identifying Network Services', description: 'Server visualization with multiple services on different ports', component: 'Chapter17', duration: 30 },
    ],
  },
  {
    id: 4,
    title: 'Core Network Protocols',
    subtitle: 'DNS, HTTP, and TLS fundamentals',
    chapters: [
      { id: 18, moduleId: 4, moduleTitle: 'Core Network Protocols', title: 'DNS — Translating Domain Names into IP Addresses', description: 'Complete DNS resolution with recursive and authoritative servers', component: 'Chapter18', duration: 45 },
      { id: 19, moduleId: 4, moduleTitle: 'Core Network Protocols', title: 'HTTP — How Web Browsers and Servers Communicate', description: 'Animated request/response with headers and status codes', component: 'Chapter19', duration: 35 },
      { id: 20, moduleId: 4, moduleTitle: 'Core Network Protocols', title: 'HTTPS — Securing HTTP with TLS', description: 'TLS 1.3 handshake with certificate validation', component: 'Chapter20', duration: 50 },
    ],
  },
  {
    id: 5,
    title: 'Securing Network Communication',
    subtitle: 'How TLS protects plaintext application protocols',
    chapters: [
      { id: 21, moduleId: 5, moduleTitle: 'Securing Network Communication', title: 'Securing HTTP with HTTPS', description: 'Plaintext to encrypted transformation visualization', component: 'Chapter21', duration: 30 },
      { id: 22, moduleId: 5, moduleTitle: 'Securing Network Communication', title: 'Securing Email Transmission — SMTP with TLS', description: 'STARTTLS upgrade mechanism demonstration', component: 'Chapter22', duration: 40 },
      { id: 23, moduleId: 5, moduleTitle: 'Securing Network Communication', title: 'Securing Email Retrieval — POP3 with TLS', description: 'STLS and implicit TLS (POP3S) comparison', component: 'Chapter23', duration: 35 },
      { id: 24, moduleId: 5, moduleTitle: 'Securing Network Communication', title: 'Securing Email Access — IMAP with TLS', description: 'IMAP synchronization with STARTTLS and IMAPS', component: 'Chapter24', duration: 35 },
      { id: 25, moduleId: 5, moduleTitle: 'Securing Network Communication', title: 'SSH vs TELNET — Secure Remote Access', description: 'Side-by-side plaintext vs encrypted comparison', component: 'Chapter25', duration: 40 },
      { id: 26, moduleId: 5, moduleTitle: 'Securing Network Communication', title: 'VPN — Creating a Secure Network over an Insecure Network', description: 'Site-to-site VPN tunnel with encapsulation', component: 'Chapter26', duration: 45 },
    ],
  },
  {
    id: 6,
    title: 'Additional Networking Core Protocols',
    subtitle: 'ICMP, WebSockets, and infrastructure',
    chapters: [
      { id: 27, moduleId: 6, moduleTitle: 'Additional Networking Core Protocols', title: 'ICMP — Network Diagnostics and Error Reporting', description: 'Ping and traceroute visualization with ICMP messages', component: 'Chapter27', duration: 30 },
      { id: 28, moduleId: 6, moduleTitle: 'Additional Networking Core Protocols', title: 'WebSockets — Real-Time Two-Way Communication', description: 'HTTP upgrade to persistent WebSocket connection', component: 'Chapter28', duration: 35 },
      { id: 29, moduleId: 6, moduleTitle: 'Additional Networking Core Protocols', title: 'How Modern Web Infrastructure Handles Network Traffic', description: 'Load balancer and reverse proxy architecture', component: 'Chapter29', duration: 30 },
    ],
  },
  {
    id: 7,
    title: 'Complete Network Communication',
    subtitle: 'End-to-end integration of all concepts',
    chapters: [
      { id: 30, moduleId: 7, moduleTitle: 'Complete Network Communication', title: 'One Complete Network Request — From Application to Server', description: 'Full end-to-end animated network journey', component: 'Chapter30', duration: 120 },
    ],
  },
];

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      modules,
      currentChapter: 1,
      currentModule: 1,
      language: 'en',
      isFullscreen: false,
      animationState: {
        isPlaying: false,
        currentTime: 0,
        duration: 30,
        speed: 1,
        progress: 0,
      },
      completedChapters: [],
      presenterMode: false,
      reducedMotion: false,

      setLanguage: (lang) => set({ language: lang }),
      
      setCurrentChapter: (chapterId) => {
        const chapter = modules.flatMap(m => m.chapters).find(c => c.id === chapterId);
        if (chapter) {
          set({ 
            currentChapter: chapterId, 
            currentModule: chapter.moduleId,
            animationState: {
              isPlaying: false,
              currentTime: 0,
              duration: chapter.duration,
              speed: 1,
              progress: 0,
            }
          });
        }
      },
      
      setCurrentModule: (moduleId) => set({ currentModule: moduleId }),
      
      toggleFullscreen: () => set((state) => ({ isFullscreen: !state.isFullscreen })),
      setFullscreen: (value) => set({ isFullscreen: value }),
      
      setAnimationState: (state) => {
        const current = get().animationState;
        const next = { ...current, ...state };
        // The chapter components animate off GSAP timelines rather than being
        // seekable, so a seek restarts the animation from the beginning.
        // The clock is pinned to a hair below the duration so the last frame is
        // represented without marking the chapter complete.
        if (state.progress !== undefined && state.currentTime === undefined) {
          const EPSILON = 0.001;
          if (next.progress >= 100) {
            next.currentTime = Math.max(0, next.duration - EPSILON);
            next.progress = 100;
            next.isPlaying = false;
          } else {
            next.currentTime = (next.progress / 100) * next.duration;
            next.isPlaying = true;
          }
        }
        set({ animationState: next });
      },
      
      togglePresenterMode: () => set((state) => ({ presenterMode: !state.presenterMode })),
      setPresenterMode: (value) => set({ presenterMode: value }),
      
      setReducedMotion: (value) => set({ reducedMotion: value }),
      
      markChapterComplete: (chapterId) => set((state) => ({
        completedChapters: state.completedChapters.includes(chapterId)
          ? state.completedChapters
          : [...state.completedChapters, chapterId]
      })),
      
      nextChapter: () => {
        const allChapters = modules.flatMap(m => m.chapters);
        const currentIndex = allChapters.findIndex(c => c.id === get().currentChapter);
        if (currentIndex < allChapters.length - 1) {
          get().setCurrentChapter(allChapters[currentIndex + 1].id);
        }
      },
      
      previousChapter: () => {
        const allChapters = modules.flatMap(m => m.chapters);
        const currentIndex = allChapters.findIndex(c => c.id === get().currentChapter);
        if (currentIndex > 0) {
          get().setCurrentChapter(allChapters[currentIndex - 1].id);
        }
      },
      
      getTotalChapters: () => modules.flatMap(m => m.chapters).length,
      getCompletedCount: () => get().completedChapters.length,
      getProgress: () => {
        const total = get().getTotalChapters();
        return total > 0 ? (get().getCompletedCount() / total) * 100 : 0;
      },
    }),
    {
      name: 'networking-core-store',
      partialize: (state) => ({
        language: state.language,
        completedChapters: state.completedChapters,
        presenterMode: state.presenterMode,
        reducedMotion: state.reducedMotion,
      }),
    }
  )
);