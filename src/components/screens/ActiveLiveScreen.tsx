import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Plus, 
  Check, 
  Heart, 
  Gift, 
  Share2, 
  Smile, 
  Send, 
  Swords, 
  Sparkles, 
  Users, 
  Volume2, 
  VolumeX, 
  Flame,
  Flag,
  RotateCcw
} from 'lucide-react';
import { 
  LiveStream, 
  ChatMessage, 
  UserProfile, 
  GiftItem, 
  PKMatchSession, 
  PKGiftEvent, 
  PKLikeEvent 
} from '../../types';
import { AvatarWithFrame } from '../common/AvatarWithFrame';
import { LevelBadge } from '../common/LevelBadge';
import { pkService } from '../../utils/pkService';

interface ActiveLiveScreenProps {
  stream: LiveStream;
  currentUser: UserProfile;
  onClose: () => void;
  onOpenGiftShop: (recipient: UserProfile) => void;
  onOpenPK: () => void;
  onSelectUser: (user: UserProfile) => void;
  activeGiftCelebration?: {
    gift: GiftItem;
    sender: string;
    recipient: string;
    quantity: number;
  } | null;
  activePKSession?: PKMatchSession | null;
  onForfeitPK?: () => void;
  onRematchPK?: () => void;
}

interface BurstParticle {
  id: number;
  burstX: number;
  burstY: number;
  color: string;
  size: number;
}

interface BurstHeart {
  id: number;
  x: number;
  y: number;
  color: string;
  hostSide: 'left' | 'right';
  rotation: number;
  particles: BurstParticle[];
}

export const ActiveLiveScreen: React.FC<ActiveLiveScreenProps> = ({
  stream,
  currentUser,
  onClose,
  onOpenGiftShop,
  onOpenPK,
  onSelectUser,
  activeGiftCelebration,
  activePKSession,
  onForfeitPK,
  onRematchPK,
}) => {
  // Permission rule: only the stream owner/creator is the live host
  const isLiveHost = currentUser.id === stream.host.id;

  const [isFollowing, setIsFollowing] = useState(stream.host.isFollowing || false);
  const [streamLikes, setStreamLikes] = useState<number>(stream.likesCount || 156420);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      senderId: 'user_lovely_star',
      senderName: 'Lovely Star 💕',
      senderAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
      text: 'So beautiful!! 😍',
      timestamp: 'Just now'
    },
    {
      id: 'm2',
      senderId: 'user_rohan',
      senderName: 'Rohan Kumar',
      senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      text: 'You are amazing! ❤️',
      timestamp: 'Just now'
    },
    {
      id: 'm3',
      senderId: 'user_pink_dreamer',
      senderName: 'Pink Dreamer',
      senderAvatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=150&auto=format&fit=crop&q=80',
      text: 'Love you! 💕',
      timestamp: '1m ago'
    },
    {
      id: 'm4',
      senderId: 'user_gaming_queen',
      senderName: 'Gaming Queen',
      senderAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      text: 'Superb! 👏',
      timestamp: '1m ago'
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [burstHearts, setBurstHearts] = useState<BurstHeart[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showForfeitConfirm, setShowForfeitConfirm] = useState(false);

  // Authoritative server timer synchronization
  const [secondsRemaining, setSecondsRemaining] = useState<number>(300);

  // Double tap gesture tracker
  const lastTapRef = useRef<{ time: number; x: number; y: number; side: string }>({ time: 0, x: 0, y: 0, side: '' });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Subscribe to PK real-time match events
  useEffect(() => {
    if (!activePKSession) return;

    pkService.subscribeToMatch(activePKSession.id);

    const updateTimer = () => {
      const now = Date.now();
      const left = Math.max(0, Math.ceil((activePKSession.endTime - now) / 1000));
      setSecondsRemaining(left);
    };

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);

    const unsubscribe = pkService.addEventListener((event, payload) => {
      if (event === 'pk:likes_updated' && payload?.likeEvent) {
        triggerHeartAnimation(
          payload.likeEvent.x || 50,
          payload.likeEvent.y || 50,
          payload.likeEvent.recipientId === activePKSession.host1.user.id ? 'left' : 'right'
        );
      } else if (event === 'pk:gift_dropped' && payload?.giftEvent) {
        showToast(`🎁 ${payload.giftEvent.sender.name} sent ${payload.giftEvent.quantity}x ${payload.giftEvent.gift.name} (+${payload.giftEvent.points} pts)!`);
      }
    });

    return () => {
      clearInterval(timerInterval);
      unsubscribe();
      pkService.unsubscribeFromMatch();
    };
  }, [activePKSession?.id, activePKSession?.endTime]);

  // Auto scroll chat to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Triggers the large, premium animated double-tap heart with particle stars
  const triggerHeartAnimation = (xPercent: number, yPercent: number, side: 'left' | 'right') => {
    const id = Date.now() + Math.random();
    const colors = ['#F328D5', '#8B20FF', '#FFC84A', '#EC4899', '#06B6D4', '#EF4444'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const rotation = (Math.random() - 0.5) * 28; // -14 to +14 deg

    // Generate 6 radial particle sparks
    const particles: BurstParticle[] = Array.from({ length: 6 }).map((_, i) => {
      const angle = (i * 60 + (Math.random() - 0.5) * 25) * (Math.PI / 180);
      const dist = 35 + Math.random() * 32;
      return {
        id: i,
        burstX: Math.cos(angle) * dist,
        burstY: Math.sin(angle) * dist,
        color: colors[i % colors.length],
        size: 4 + Math.random() * 4,
      };
    });

    setBurstHearts((prev) => [
      ...prev,
      { id, x: xPercent, y: yPercent, color: randomColor, hostSide: side, rotation, particles }
    ]);

    setTimeout(() => {
      setBurstHearts((prev) => prev.filter((h) => h.id !== id));
    }, 1300);
  };

  // Universal Double-Tap Gesture Handler across the entire live video viewing area
  const handleAreaPointerDown = (e: React.PointerEvent<HTMLDivElement>, side: 'left' | 'right' = 'left') => {
    // Avoid double-tap on child buttons or inputs
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('form')) {
      return;
    }

    if (isLiveHost) return; // Live hosts manage the stream; viewers like

    const now = Date.now();
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;
    const prev = lastTapRef.current;
    const dist = Math.hypot(clientX - prev.x, clientY - prev.y);

    if (now - prev.time < 380 && dist < 70 && prev.side === side) {
      // Verified Double Tap detected anywhere in viewing area!
      lastTapRef.current = { time: 0, x: 0, y: 0, side: '' };
      const xPercent = Math.max(8, Math.min(92, ((clientX - rect.left) / rect.width) * 100));
      const yPercent = Math.max(10, Math.min(88, ((clientY - rect.top) / rect.height) * 100));

      triggerHeartAnimation(xPercent, yPercent, side);
      setStreamLikes((prev) => prev + 1);

      if (activePKSession) {
        const targetHostId = side === 'left' ? activePKSession.host1.user.id : activePKSession.host2.user.id;
        pkService.sendPKLike(activePKSession.id, targetHostId, 1, xPercent, yPercent);
      }
    } else {
      lastTapRef.current = { time: now, x: clientX, y: clientY, side };
    }
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      senderVip: currentUser.vipLevel,
      text: inputMessage.trim(),
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMessage('');
    setShowEmojiPicker(false);
  };

  const handleSendEmoji = (emoji: string) => {
    setInputMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  // PK Scoring calculations
  const host1 = activePKSession?.host1;
  const host2 = activePKSession?.host2;
  const totalScore = (host1?.score || 0) + (host2?.score || 0) || 1;
  const percent1 = Math.round(((host1?.score || 0) / totalScore) * 100);
  const percent2 = 100 - percent1;
  const leadingSide = (host1?.score || 0) > (host2?.score || 0) ? 'left' : (host2?.score || 0) > (host1?.score || 0) ? 'right' : 'tie';

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden flex flex-col justify-between select-none animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-[#8B20FF] text-white text-xs font-bold py-2 px-4 rounded-full shadow-lg shadow-[#8B20FF]/50 animate-fade-in pointer-events-none">
          {toastMessage}
        </div>
      )}

      {/* Forfeit Confirmation Modal */}
      {showForfeitConfirm && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#160C25] border border-red-500/30 p-5 rounded-3xl text-center space-y-4">
            <h4 className="text-base font-bold text-white">Forfeit PK Battle?</h4>
            <p className="text-xs text-[#B9AECF]">
              Forfeiting will immediately award victory to the opposing host. Are you sure?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowForfeitConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 text-white text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowForfeitConfirm(false);
                  onForfeitPK?.();
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
              >
                Confirm Forfeit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Video Area: Either Single Host OR Split-Screen PK Battle */}
      {activePKSession && host1 && host2 ? (
        /* PK Split-Screen Arena */
        <div className="absolute inset-0 z-0 flex flex-col sm:flex-row bg-[#090611]">
          {/* Left Host Panel (Host 1 / Team Blue) */}
          <div 
            onPointerDown={(e) => handleAreaPointerDown(e, 'left')}
            className="relative flex-1 h-1/2 sm:h-full overflow-hidden border-b-2 sm:border-b-0 sm:border-r-2 border-[#06B6D4]/50 cursor-pointer group select-none touch-manipulation"
          >
            <img
              src={host1.user.coverImage || stream.coverImage}
              alt={host1.user.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover filter brightness-95 pointer-events-none"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/60 pointer-events-none" />

            {/* Host 1 Floating Tag & Score */}
            <div className="absolute top-16 sm:top-20 left-3 z-20 flex items-center gap-2 bg-black/50 backdrop-blur-md p-1.5 pr-3 rounded-full border border-[#06B6D4]/40">
              <AvatarWithFrame
                avatar={host1.user.avatar}
                name={host1.user.name}
                level={host1.user.level || 40}
                size="sm"
              />
              <div className="flex flex-col">
                <span className="text-xs font-black text-white truncate max-w-[100px]">
                  {host1.user.name}
                </span>
                <span className="text-[10px] text-[#06B6D4] font-mono font-bold">
                  {host1.score.toLocaleString()} pts
                </span>
              </div>
              {leadingSide === 'left' && (
                <span className="px-1.5 py-0.5 rounded-full bg-[#FFC84A] text-[#090611] text-[9px] font-black uppercase tracking-wider animate-pulse">
                  LEAD
                </span>
              )}
            </div>

            {/* Like counter pill on host 1 side */}
            <div className="absolute bottom-20 left-3 z-20 flex items-center gap-1 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full text-xs text-rose-400 font-mono">
              <Heart className="w-3.5 h-3.5 fill-rose-500 stroke-rose-500" />
              <span>{host1.likes.toLocaleString()}</span>
            </div>

            {/* Large Burst Hearts for Left Host */}
            {burstHearts
              .filter((h) => h.hostSide === 'left')
              .map((heart) => (
                <div
                  key={heart.id}
                  className="absolute pointer-events-none z-30 select-none animate-double-tap-heart"
                  style={{ left: `${heart.x}%`, top: `${heart.y}%` }}
                >
                  {/* Particle Sparkles */}
                  {heart.particles.map((p) => (
                    <div
                      key={p.id}
                      className="absolute pointer-events-none rounded-full animate-particle-sparkle"
                      style={{
                        left: '50%',
                        top: '50%',
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        backgroundColor: p.color,
                        boxShadow: `0 0 10px ${p.color}`,
                        '--burst-x': `${p.burstX}px`,
                        '--burst-y': `${p.burstY}px`,
                      } as React.CSSProperties}
                    />
                  ))}
                  {/* Large Glowing Animated Heart */}
                  <div className="relative flex items-center justify-center">
                    <svg
                      viewBox="0 0 24 24"
                      className="w-16 h-16 sm:w-20 sm:h-20 filter drop-shadow-[0_0_20px_#F328D5] drop-shadow-[0_0_35px_#FFC84A]"
                      style={{ transform: `rotate(${heart.rotation}deg)` }}
                    >
                      <defs>
                        <linearGradient id={`pkHeartGradL_${heart.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#06B6D4" />
                          <stop offset="50%" stopColor="#F328D5" />
                          <stop offset="100%" stopColor="#8B20FF" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                        fill={`url(#pkHeartGradL_${heart.id})`}
                        stroke="#FFFFFF"
                        strokeWidth="0.8"
                      />
                    </svg>
                    <span className="absolute -top-1 -right-2 px-1.5 py-0.2 rounded-full bg-gradient-to-r from-[#06B6D4] to-[#F328D5] text-white text-[10px] font-black font-mono shadow-md">
                      +1
                    </span>
                  </div>
                </div>
              ))}
          </div>

          {/* Right Host Panel (Host 2 / Team Red) */}
          <div 
            onPointerDown={(e) => handleAreaPointerDown(e, 'right')}
            className="relative flex-1 h-1/2 sm:h-full overflow-hidden border-t-2 sm:border-t-0 sm:border-l-2 border-[#EF4444]/50 cursor-pointer group select-none touch-manipulation"
          >
            <img
              src={host2.user.coverImage || host2.user.avatar}
              alt={host2.user.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover filter brightness-95 pointer-events-none"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/60 pointer-events-none" />

            {/* Host 2 Floating Tag & Score */}
            <div className="absolute top-16 sm:top-20 right-3 z-20 flex items-center gap-2 bg-black/50 backdrop-blur-md p-1.5 pl-3 rounded-full border border-[#EF4444]/40">
              {leadingSide === 'right' && (
                <span className="px-1.5 py-0.5 rounded-full bg-[#FFC84A] text-[#090611] text-[9px] font-black uppercase tracking-wider animate-pulse">
                  LEAD
                </span>
              )}
              <div className="flex flex-col text-right">
                <span className="text-xs font-black text-white truncate max-w-[100px]">
                  {host2.user.name}
                </span>
                <span className="text-[10px] text-[#EF4444] font-mono font-bold">
                  {host2.score.toLocaleString()} pts
                </span>
              </div>
              <AvatarWithFrame
                avatar={host2.user.avatar}
                name={host2.user.name}
                level={host2.user.level || 40}
                size="sm"
              />
            </div>

            {/* Like counter pill on host 2 side */}
            <div className="absolute bottom-20 right-3 z-20 flex items-center gap-1 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full text-xs text-rose-400 font-mono">
              <Heart className="w-3.5 h-3.5 fill-rose-500 stroke-rose-500" />
              <span>{host2.likes.toLocaleString()}</span>
            </div>

            {/* Large Burst Hearts for Right Host */}
            {burstHearts
              .filter((h) => h.hostSide === 'right')
              .map((heart) => (
                <div
                  key={heart.id}
                  className="absolute pointer-events-none z-30 select-none animate-double-tap-heart"
                  style={{ left: `${heart.x}%`, top: `${heart.y}%` }}
                >
                  {/* Particle Sparkles */}
                  {heart.particles.map((p) => (
                    <div
                      key={p.id}
                      className="absolute pointer-events-none rounded-full animate-particle-sparkle"
                      style={{
                        left: '50%',
                        top: '50%',
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        backgroundColor: p.color,
                        boxShadow: `0 0 10px ${p.color}`,
                        '--burst-x': `${p.burstX}px`,
                        '--burst-y': `${p.burstY}px`,
                      } as React.CSSProperties}
                    />
                  ))}
                  {/* Large Glowing Animated Heart */}
                  <div className="relative flex items-center justify-center">
                    <svg
                      viewBox="0 0 24 24"
                      className="w-16 h-16 sm:w-20 sm:h-20 filter drop-shadow-[0_0_20px_#EF4444] drop-shadow-[0_0_35px_#FFC84A]"
                      style={{ transform: `rotate(${heart.rotation}deg)` }}
                    >
                      <defs>
                        <linearGradient id={`pkHeartGradR_${heart.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#FFC84A" />
                          <stop offset="50%" stopColor="#EF4444" />
                          <stop offset="100%" stopColor="#F328D5" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                        fill={`url(#pkHeartGradR_${heart.id})`}
                        stroke="#FFFFFF"
                        strokeWidth="0.8"
                      />
                    </svg>
                    <span className="absolute -top-1 -right-2 px-1.5 py-0.2 rounded-full bg-gradient-to-r from-[#EF4444] to-[#F328D5] text-white text-[10px] font-black font-mono shadow-md">
                      +1
                    </span>
                  </div>
                </div>
              ))}
          </div>

          {/* Centered Battle Arena VS & Authoritative 5-Minute Countdown */}
          <div className="absolute top-14 sm:top-16 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none">
            {/* 5-Minute Timer Badge */}
            <div className="px-3.5 py-1 rounded-full bg-red-600/90 backdrop-blur-md border border-white/20 text-white font-mono text-xs font-black shadow-lg shadow-red-600/50 flex items-center gap-1.5 mb-2 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span>{minutes}:{seconds < 10 ? `0${seconds}` : seconds}</span>
            </div>

            {/* VS Badge */}
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#EF4444] via-[#F59E0B] to-[#06B6D4] p-[2px] shadow-2xl">
              <div className="w-full h-full rounded-full bg-[#090611] flex items-center justify-center text-white font-black text-xs font-display">
                VS
              </div>
            </div>
          </div>

          {/* Tug-of-War Score Bar at Top */}
          <div className="absolute top-28 sm:top-32 left-4 right-4 z-20 max-w-lg mx-auto pointer-events-none">
            <div className="flex justify-between text-[11px] font-black font-mono px-1 mb-1 text-shadow">
              <span className="text-[#06B6D4]">{percent1}%</span>
              <span className="text-white/80 text-[10px] uppercase tracking-wider">Live Battle Tug</span>
              <span className="text-[#EF4444]">{percent2}%</span>
            </div>
            <div className="w-full h-3 rounded-full bg-black/60 border border-white/10 p-0.5 overflow-hidden flex shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] rounded-l-full transition-all duration-500 ease-out shadow-[0_0_8px_#06B6D4]"
                style={{ width: `${percent1}%` }}
              />
              <div
                className="h-full bg-gradient-to-r from-[#F59E0B] to-[#EF4444] rounded-r-full transition-all duration-500 ease-out shadow-[0_0_8px_#EF4444]"
                style={{ width: `${percent2}%` }}
              />
            </div>
          </div>
        </div>
      ) : (
        /* Standard Single-Host Live Stream with Full-Screen Double-Tap */
        <div 
          onPointerDown={(e) => handleAreaPointerDown(e, 'left')}
          className="absolute inset-0 z-0 cursor-pointer overflow-hidden select-none touch-manipulation"
        >
          <img
            src={stream.coverImage}
            alt={stream.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover filter brightness-95 pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-transparent to-black/90 pointer-events-none" />

          {/* Large Premium Double-Tap Burst Hearts across the Entire Live Video Screen */}
          {burstHearts.map((heart) => (
            <div
              key={heart.id}
              className="absolute pointer-events-none z-30 select-none animate-double-tap-heart"
              style={{ left: `${heart.x}%`, top: `${heart.y}%` }}
            >
              {/* Particle Sparkles exploding around the heart */}
              {heart.particles.map((p) => (
                <div
                  key={p.id}
                  className="absolute pointer-events-none rounded-full animate-particle-sparkle"
                  style={{
                    left: '50%',
                    top: '50%',
                    width: `${p.size}px`,
                    height: `${p.size}px`,
                    backgroundColor: p.color,
                    boxShadow: `0 0 10px ${p.color}`,
                    '--burst-x': `${p.burstX}px`,
                    '--burst-y': `${p.burstY}px`,
                  } as React.CSSProperties}
                />
              ))}

              {/* Large Animated Neon Heart Icon with Gradient, Glow and "Double Tap!" Banner (Screen A) */}
              <div className="relative flex flex-col items-center justify-center animate-double-tap-heart">
                <svg
                  viewBox="0 0 24 24"
                  className="w-24 h-24 sm:w-28 sm:h-28 filter drop-shadow-[0_0_25px_#F328D5] drop-shadow-[0_0_40px_#FFC84A]"
                  style={{ transform: `rotate(${heart.rotation}deg)` }}
                >
                  <defs>
                    <linearGradient id={`singleHeartGrad_${heart.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFC84A" />
                      <stop offset="35%" stopColor="#F328D5" />
                      <stop offset="100%" stopColor="#8B20FF" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                    fill={`url(#singleHeartGrad_${heart.id})`}
                    stroke="#FFFFFF"
                    strokeWidth="0.8"
                  />
                </svg>

                {/* "Double Tap!" glowing banner text matching Screen A */}
                <div className="mt-1 px-4 py-1 rounded-full bg-black/60 backdrop-blur-md border border-[#F328D5]/60 shadow-[0_0_20px_rgba(243,40,213,0.8)]">
                  <span className="text-sm font-black text-white tracking-wider drop-shadow-[0_0_10px_#F328D5]">
                    Double Tap!
                  </span>
                </div>

                {/* Floating neon +1 badge */}
                <span className="absolute -top-1 -right-2 px-2 py-0.5 rounded-full bg-gradient-to-r from-[#FFC84A] to-[#F328D5] text-[#090611] text-[11px] font-black font-mono shadow-lg shadow-[#F328D5]/60 animate-pulse">
                  +1
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Top Header Bar & Level Indicator matching Screen A */}
      <div className="relative z-30 flex flex-col p-3 sm:p-5 pt-safe gap-2">
        <div className="flex items-center justify-between">
          {/* Host Profile Info Pill matching Screen A: Queen Girl 👑 • 🔥 123.4K • [Follow] */}
          <div 
            onClick={() => onSelectUser(stream.host)}
            className="flex items-center gap-2 bg-black/55 backdrop-blur-md border border-white/10 rounded-full pl-1.5 pr-2.5 py-1 cursor-pointer hover:bg-black/70 transition-colors shadow-lg"
          >
            <AvatarWithFrame
              avatar={stream.host.avatar}
              name={stream.host.name}
              level={stream.host.level || 42}
              size="sm"
            />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white leading-tight flex items-center gap-1">
                {stream.host.name}
              </span>
              <span className="text-[10px] text-[#FFC84A] font-bold leading-tight flex items-center gap-0.5">
                <span>🔥</span>
                <span>{stream.host.fansCount || '123.4K'}</span>
              </span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsFollowing(!isFollowing);
                showToast(!isFollowing ? `Followed ${stream.host.name}!` : `Unfollowed`);
              }}
              className={`ml-1 px-3 py-1 rounded-full text-[11px] font-bold transition-all active:scale-95 ${
                isFollowing
                  ? 'bg-white/20 text-white'
                  : 'bg-gradient-to-r from-[#8B20FF] to-[#F328D5] text-white shadow-md shadow-[#F328D5]/30'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          </div>

          {/* Right Action Controls: Viewer Count "👁️ 1.2K" & Close "✕" */}
          <div className="flex items-center gap-2">
            {/* Viewer Count Pill: 👁️ 1.2K */}
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-black/55 backdrop-blur-md text-white text-xs font-bold border border-white/10 shadow">
              <span>👁️</span>
              <span className="font-mono">{stream.viewerCount || '1.2K'}</span>
            </div>

            {/* Audio Mute toggle */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* PK Match / Live Battle Button (AUTHORIZED HOST ONLY) */}
            {isLiveHost && (
              activePKSession ? (
                <button
                  onClick={() => setShowForfeitConfirm(true)}
                  className="px-2.5 py-1 rounded-full bg-red-600/80 hover:bg-red-600 text-white text-[11px] font-bold flex items-center gap-1 border border-white/20 shadow active:scale-95 transition-all"
                  title="Forfeit PK Battle"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>Forfeit</span>
                </button>
              ) : (
                <button
                  onClick={onOpenPK}
                  className="px-3 py-1 rounded-full bg-gradient-to-r from-[#F59E0B] via-[#EF4444] to-[#F328D5] text-white text-[11px] font-black flex items-center gap-1.5 shadow-lg shadow-red-500/25 active:scale-95 transition-all animate-pulse"
                  title="Challenge eligible host to PK Battle"
                >
                  <Swords className="w-3.5 h-3.5" />
                  <span>PK BATTLE</span>
                </button>
              )
            )}

            {/* Close Stream / Leave Button "✕" */}
            <button
              onClick={onClose}
              className={`w-8 h-8 rounded-full backdrop-blur-md border border-white/10 flex items-center justify-center transition-colors ${
                isLiveHost ? 'bg-red-600/60 hover:bg-red-600 text-white' : 'bg-black/50 hover:bg-black/80 text-white'
              }`}
              title={isLiveHost ? 'End Live Broadcast' : 'Exit Live Stream'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Level Progress Bar & "🔥 Hot Live" Pill (Screen A exact match) */}
        <div className="flex flex-col items-start gap-1.5 pt-0.5">
          {/* Level 42 [========] 68% progress bar */}
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 shadow">
            <span className="px-1.5 py-0.2 rounded-md bg-[#FFC84A] text-[#090611] text-[10px] font-black">
              Lv.{stream.host.level || 42}
            </span>
            <div className="w-20 sm:w-28 h-2 rounded-full bg-white/20 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#FFC84A] to-[#F59E0B] rounded-full shadow-[0_0_8px_#FFC84A]"
                style={{ width: '68%' }}
              />
            </div>
            <span className="text-[10px] font-mono font-bold text-white/90">
              68%
            </span>
          </div>

          {/* "🔥 Hot Live" Badge */}
          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#FF2E93] to-[#FF007A] text-white text-[10px] font-black shadow-md shadow-pink-500/30 animate-pulse">
            <span>🔥</span>
            <span>Hot Live</span>
          </div>
        </div>
      </div>

      {/* Middle Interactive Chat Area */}
      <div className="flex-1 relative flex flex-col justify-end p-4 pb-2 z-20 max-w-xl pointer-events-none">
        {/* Chat message stream */}
        <div className="w-full max-h-48 overflow-y-auto no-scrollbar space-y-2 mb-2 pr-2 pointer-events-auto">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="inline-flex items-center gap-1.5 bg-black/50 backdrop-blur-md rounded-2xl py-1 px-3 border border-white/[0.08] text-xs max-w-[90%] shadow-sm"
            >
              <span className="font-bold text-[#FFC84A] shrink-0">
                {msg.senderName} :
              </span>
              <span className="text-white font-medium break-words">
                {msg.text}
              </span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* PK Battle Banner (Host Only - Viewers do not see disabled or host-only prompts) */}
        {!activePKSession && isLiveHost && (
          <div className="pointer-events-auto mb-2">
            <button
              onClick={onOpenPK}
              className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-[#211333] via-[#351854] to-[#451261] border border-[#8B20FF]/50 hover:border-[#F328D5] text-left flex items-center justify-between transition-all group shadow-lg active:scale-98"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FFC84A] to-[#F59E0B] text-[#090611] flex items-center justify-center font-bold text-sm shadow">
                  👑
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-white group-hover:text-pink-200 transition-colors">
                    PK Battle
                  </span>
                  <span className="text-[10px] text-[#B9AECF]">
                    Tap to challenge another live host
                  </span>
                </div>
              </div>

              <div className="px-3 py-1 rounded-full bg-gradient-to-r from-[#8B20FF] to-[#F328D5] text-white text-[11px] font-extrabold shadow">
                Start PK
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Bottom Floating Interactive Bar */}
      <div className="relative z-30 p-3 sm:p-4 pb-safe bg-gradient-to-t from-black via-black/85 to-transparent">
        {/* PK Quick Support Selector when Battle is Live */}
        {activePKSession && host1 && host2 && (
          <div className="flex items-center justify-between gap-3 mb-3 max-w-xl mx-auto">
            <button
              onClick={() => onOpenGiftShop(host1.user)}
              className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] text-white text-xs font-bold shadow-lg shadow-cyan-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <Gift className="w-3.5 h-3.5" />
              <span>Gift {host1.user.name.split(' ')[0]}</span>
            </button>

            <button
              onClick={() => onOpenGiftShop(host2.user)}
              className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#EF4444] to-[#F59E0B] text-white text-xs font-bold shadow-lg shadow-red-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <Gift className="w-3.5 h-3.5" />
              <span>Gift {host2.user.name.split(' ')[0]}</span>
            </button>
          </div>
        )}

        {/* Emoji Bar */}
        {showEmojiPicker && (
          <div className="flex items-center gap-2 mb-3 bg-[#160C25]/90 backdrop-blur-md p-2 rounded-2xl border border-white/10 w-fit animate-fade-in shadow-xl">
            {['😍', '🔥', '👑', '💖', '👏', '🎉', '🌹', '💎'].map((em) => (
              <button
                key={em}
                onClick={() => handleSendEmoji(em)}
                className="text-xl hover:scale-125 transition-transform p-1"
              >
                {em}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between gap-2 max-w-xl mx-auto">
          {/* Chat Input Field: "Say something..." matching Screen A */}
          <form 
            onSubmit={handleSendMessage}
            className="flex-1 flex items-center bg-black/55 backdrop-blur-md border border-white/15 rounded-full px-4 py-2.5 focus-within:border-[#F328D5] transition-colors shadow-lg"
          >
            <input
              type="text"
              placeholder="Say something..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="w-full bg-transparent text-xs text-white placeholder-white/50 outline-none"
            />
            {inputMessage ? (
              <button
                type="submit"
                className="w-6 h-6 rounded-full bg-[#F328D5] text-white flex items-center justify-center shrink-0 ml-1 shadow"
              >
                <Send className="w-3 h-3" />
              </button>
            ) : null}
          </form>

          {/* Virtual Gift Button 🎁 (Screen A) */}
          <button
            onClick={() => onOpenGiftShop(stream.host)}
            className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#8B20FF] via-[#F328D5] to-[#FFC84A] flex items-center justify-center text-white shadow-lg shadow-[#F328D5]/50 active:scale-95 transition-all animate-pulse"
            title="Send Gift"
          >
            <Gift className="w-5 h-5 text-white stroke-[2.2]" />
          </button>

          {/* Share Stream Button ↪ (Screen A) */}
          <button
            onClick={() => showToast('Live stream link copied to clipboard! 📋')}
            className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:text-[#06B6D4] transition-colors active:scale-95 shadow"
            title="Share Stream"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* More Button ⋮ (Screen A) */}
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:text-[#FFC84A] transition-colors active:scale-95 shadow"
            title="More Options"
          >
            <span className="text-base font-bold">⋮</span>
          </button>
        </div>
      </div>
    </div>
  );
};
