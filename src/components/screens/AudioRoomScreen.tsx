import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  MoreVertical, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Gift, 
  Share2, 
  Plus, 
  Crown, 
  Heart, 
  Send, 
  Users,
  X,
  Swords,
  Radio,
  Sliders,
  Sparkles,
  Info
} from 'lucide-react';
import { PartyRoom, UserProfile, GiftItem, RoomSeatRequest } from '../../types';
import { roomService } from '../../utils/roomService';
import { pkService } from '../../utils/pkService';
import { MOCK_USERS } from '../../data/mockData';

interface AudioRoomScreenProps {
  room: PartyRoom;
  currentUser: UserProfile;
  onClose: () => void;
  onOpenGiftShop: (recipient: UserProfile) => void;
  onSelectUser: (user: UserProfile) => void;
  onOpenPK?: () => void;
  activeGiftCelebration?: {
    gift: GiftItem;
    sender: string;
    recipient: string;
    quantity: number;
  } | null;
}

interface FloatingHeart {
  id: number;
  x: number;
  y: number;
  color: string;
}

export const AudioRoomScreen: React.FC<AudioRoomScreenProps> = ({
  room,
  currentUser,
  onClose,
  onOpenGiftShop,
  onSelectUser,
  onOpenPK,
  activeGiftCelebration,
}) => {
  // Role determination: Is current user the Room Host?
  const isRoomHost = currentUser.id === room.host.id;

  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  
  // Seat mode: 8-seat or 16-seat
  const [seatMode, setSeatMode] = useState<8 | 16>(room.maxSeats === 16 ? 16 : 8);

  // Initialize 8-seat default matching Screen B showcase
  const default8Seats: (UserProfile | null)[] = [
    MOCK_USERS.rohan,     // Seat 1
    MOCK_USERS.sara,      // Seat 2
    MOCK_USERS.king,      // Seat 3
    MOCK_USERS.angel,     // Seat 4
    MOCK_USERS.mr_khan,   // Seat 5
    MOCK_USERS.pink_girl, // Seat 6
    null,                 // Seat 7 (empty + Join)
    null                  // Seat 8 (empty + Join)
  ];

  // 16-seat mode layout
  const default16Seats: (UserProfile | null)[] = [
    MOCK_USERS.rohan,
    MOCK_USERS.sara,
    MOCK_USERS.king,
    MOCK_USERS.angel,
    MOCK_USERS.mr_khan,
    MOCK_USERS.pink_girl,
    MOCK_USERS.sweetie,
    MOCK_USERS.rdxgamer,
    MOCK_USERS.devilboy,
    MOCK_USERS.zoya,
    null,
    null,
    null,
    null,
    null,
  ];

  const [seats, setSeats] = useState<(UserProfile | null)[]>(
    seatMode === 16 ? default16Seats : default8Seats
  );

  const [pendingRequests, setPendingRequests] = useState<RoomSeatRequest[]>([]);
  const [myPendingRequest, setMyPendingRequest] = useState<RoomSeatRequest | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [speakingIndex, setSpeakingIndex] = useState<number>(0);
  const [roomLikes, setRoomLikes] = useState<number>(128400);
  const [hasLiked, setHasLiked] = useState<boolean>(false);
  const [floatingHearts, setFloatingHearts] = useState<FloatingHeart[]>([]);
  const [showRoomDetails, setShowRoomDetails] = useState<boolean>(false);

  // Showcase room chat stream matching Screen B
  const [roomMessages, setRoomMessages] = useState<Array<{ id: string; name: string; avatar: string; text: string }>>([
    {
      id: 'm1',
      name: 'Rohan Kumar',
      avatar: MOCK_USERS.rohan.avatar,
      text: 'Nice Room! ❤️'
    },
    {
      id: 'm2',
      name: 'Sara',
      avatar: MOCK_USERS.sara.avatar,
      text: 'Love this room! 😍'
    },
    {
      id: 'm3',
      name: 'King',
      avatar: MOCK_USERS.king.avatar,
      text: 'Welcome everyone! 👏'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const lastTapRef = useRef<number>(0);

  // Switch seat modes (8 or 16)
  useEffect(() => {
    if (seatMode === 16) {
      setSeats(default16Seats);
    } else {
      setSeats(default8Seats);
    }
  }, [seatMode]);

  // Speaking indicator simulation (pulses host or member avatar like real live audio app)
  useEffect(() => {
    const interval = setInterval(() => {
      const activeMembers = seats.filter(Boolean).length;
      // 0 is host stage, 1..activeMembers are members
      const randomSpeaker = Math.floor(Math.random() * (activeMembers + 1));
      setSpeakingIndex(randomSpeaker);
    }, 2400);
    return () => clearInterval(interval);
  }, [seats]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Like button / double tap interaction
  const handleLike = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setRoomLikes((prev) => prev + 1);
    setHasLiked(true);
    
    // Spawn floating heart
    const id = Date.now() + Math.random();
    const colors = ['#F328D5', '#8B20FF', '#FFC84A', '#06B6D4', '#EC4899'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const x = 50 + (Math.random() * 40 - 20);
    const y = 60 + (Math.random() * 20 - 10);
    setFloatingHearts((prev) => [...prev, { id, x, y, color: randomColor }]);
    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== id));
    }, 1800);
  };

  // Double tap anywhere on room background
  const handleBackgroundTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const now = Date.now();
    if (now - lastTapRef.current < 350) {
      handleLike();
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  };

  // Click on empty seat -> Join seat
  const handleJoinSeat = (index: number) => {
    if (seats[index]) {
      onSelectUser(seats[index]!);
      return;
    }

    // Occupy the seat immediately in UI for responsive UX
    const updated = [...seats];
    updated[index] = currentUser;
    setSeats(updated);
    showToast(`You joined Seat #${index + 1}! 🎙️`);
    
    // Broadcast message to room chat
    setRoomMessages((prev) => [
      ...prev,
      {
        id: `sys_${Date.now()}`,
        name: currentUser.name,
        avatar: currentUser.avatar,
        text: `joined Seat #${index + 1} 🎙️`
      }
    ]);
  };

  // Send room chat message
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim()) return;

    setRoomMessages((prev) => [
      ...prev,
      {
        id: `chat_${Date.now()}`,
        name: currentUser.name,
        avatar: currentUser.avatar,
        text: inputMessage.trim()
      }
    ]);
    setInputMessage('');
    setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  const isHostSpeaking = speakingIndex === 0;

  return (
    <div 
      onClick={handleBackgroundTap}
      className="fixed inset-0 z-50 w-full h-full bg-[#080413] flex flex-col justify-between overflow-hidden select-none animate-fade-in"
    >
      {/* Toast Alert */}
      {toastMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-[#8B20FF] text-white text-xs font-bold py-2 px-5 rounded-full shadow-lg shadow-[#8B20FF]/50 animate-fade-in pointer-events-none">
          {toastMessage}
        </div>
      )}

      {/* Gift Celebration Alert */}
      {activeGiftCelebration && (
        <div className="absolute top-16 left-4 right-4 z-40 bg-gradient-to-r from-[#8B20FF]/95 via-[#F328D5]/95 to-[#FFC84A]/95 backdrop-blur-md rounded-2xl p-3 border border-white/20 shadow-2xl flex items-center justify-between animate-bounce">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{activeGiftCelebration.gift.icon}</span>
            <div className="flex flex-col">
              <span className="text-xs font-black text-white">
                {activeGiftCelebration.sender} sent {activeGiftCelebration.quantity}x {activeGiftCelebration.gift.name}!
              </span>
              <span className="text-[10px] text-[#FFC84A] font-bold">
                Drop: {activeGiftCelebration.gift.coins * activeGiftCelebration.quantity} Coins
              </span>
            </div>
          </div>
          <span className="text-xl">🎉</span>
        </div>
      )}

      {/* Neon Atmospheric Background with Spotlight Stage Rays */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Center purple glow */}
        <div className="absolute top-28 left-1/2 -translate-x-1/2 w-[420px] h-[340px] rounded-full bg-gradient-to-b from-[#8B20FF]/30 via-[#F328D5]/20 to-transparent blur-[90px]" />
        {/* Spotlight rays behind stage */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-96 opacity-35 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#8B20FF] via-[#F328D5]/10 to-transparent pointer-events-none" />
      </div>

      {/* Floating Hearts from Likes */}
      {floatingHearts.map((h) => (
        <div
          key={h.id}
          className="absolute pointer-events-none text-3xl animate-double-tap-heart drop-shadow-[0_0_15px_#F328D5] z-30"
          style={{ left: `${h.x}%`, top: `${h.y}%`, color: h.color }}
        >
          ❤️
        </div>
      ))}

      {/* ========================================================
          1. HEADER BAR (Exact match to Screen B reference)
          - Left: Back Arrow ←
          - Center: Title "Queen's Party Room 👑", subtext "ID: 10086 • 👁️ 8.2K"
          - Right: Purple "Like" button, and More button ⋮
         ======================================================== */}
      <header className="relative z-30 flex items-center justify-between px-4 pt-safe pt-3 pb-2 border-b border-white/[0.06] bg-[#080413]/70 backdrop-blur-md">
        {/* Back Arrow */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white active:scale-95 transition-all"
          title="Exit Room"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Room Title & Room ID */}
        <div 
          onClick={(e) => {
            e.stopPropagation();
            setShowRoomDetails(!showRoomDetails);
          }}
          className="flex flex-col items-center cursor-pointer text-center"
        >
          <h2 className="text-base font-extrabold text-white flex items-center gap-1.5 leading-tight">
            <span>{room.title || "Queen's Party Room 👑"}</span>
          </h2>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-[#B9AECF]">
            <span className="font-mono text-[11px]">ID: 10086</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-[#FFC84A] font-semibold text-[11px]">
              <span>👁️</span>
              <span>{room.participantCount || '8.2K'}</span>
            </span>
          </div>
        </div>

        {/* Right Controls: Like & More */}
        <div className="flex items-center gap-2">
          {/* Capacity Switcher (8-Seats vs 16-Seats) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              const next = seatMode === 8 ? 16 : 8;
              setSeatMode(next);
              showToast(`Switched to ${next}-Seat Room Layout!`);
            }}
            className="px-2 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-[10px] font-bold text-white transition-all"
            title="Toggle 8-Seat or 16-Seat layout"
          >
            👥 {seatMode}S
          </button>

          {/* Purple Like Button matching Screen B */}
          <button
            onClick={handleLike}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 flex items-center gap-1 shadow-md ${
              hasLiked 
                ? 'bg-[#F328D5] text-white shadow-[#F328D5]/40' 
                : 'bg-gradient-to-r from-[#8B20FF] to-[#F328D5] text-white hover:opacity-90 shadow-[#8B20FF]/30'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-white' : ''}`} />
            <span>Like</span>
          </button>

          {/* More Options ⋮ */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowRoomDetails(!showRoomDetails);
            }}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white active:scale-95 transition-all"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Room Details Modal / Drawer */}
      {showRoomDetails && (
        <div 
          onClick={(e) => e.stopPropagation()} 
          className="absolute top-16 left-4 right-4 z-40 bg-[#160C25] border border-white/15 rounded-3xl p-4 shadow-2xl text-white space-y-3 animate-fade-in"
        >
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-sm font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#FFC84A]" />
              <span>Party Room Details</span>
            </span>
            <button onClick={() => setShowRoomDetails(false)} className="text-[#B9AECF] hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-[#B9AECF] leading-relaxed">
            {room.announcement || "Welcome to Queen's Party Room! Chat, sing, make friends and enjoy high energy music! 👑✨"}
          </p>
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-[#B9AECF]">Room Capacity:</span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setSeatMode(8)}
                className={`px-3 py-1 rounded-xl font-bold ${seatMode === 8 ? 'bg-[#F328D5] text-white' : 'bg-white/10 text-[#B9AECF]'}`}
              >
                8 Seats
              </button>
              <button
                onClick={() => setSeatMode(16)}
                className={`px-3 py-1 rounded-xl font-bold ${seatMode === 16 ? 'bg-[#F328D5] text-white' : 'bg-white/10 text-[#B9AECF]'}`}
              >
                16 Seats
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Interactive Stage & Seating Canvas */}
      <main className="relative z-10 flex-1 flex flex-col justify-between px-3 sm:px-6 pt-2 pb-1 overflow-y-auto no-scrollbar">
        
        {/* ========================================================
            2. ELEVATED ROYAL CROWNED HOST STAGE (Screen B Top)
            - 👑 Host badge on upper-left
            - Golden Crown on frame
            - Large circular host avatar (Queen Girl)
            - Soundwave / speaker graphic glow in background
            - Host pill underneath: "Queen Girl 👑 🎙️"
           ======================================================== */}
        <section className="relative flex flex-col items-center justify-center my-1 select-none">
          {/* Top Host Stage Crown & Spotlight aura */}
          <div className="relative flex flex-col items-center">
            
            {/* Host Badge floating on top-left of stage */}
            <div className="absolute -top-1 -left-12 sm:-left-16 z-20 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#FFC84A] to-[#F59E0B] text-[#090611] text-[10px] font-black shadow-md shadow-[#FFC84A]/30">
              <Crown className="w-3 h-3 fill-current" />
              <span>Host</span>
            </div>

            {/* Stage Soundwave Background Graphics */}
            <div className="absolute -inset-10 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-32 rounded-full border border-[#8B20FF]/30 bg-[#8B20FF]/10 blur-xl animate-pulse" />
              {/* Audio waveform bars flanking stage */}
              <div className="absolute -left-10 flex items-center gap-1 opacity-70">
                <span className="w-1 h-6 bg-[#8B20FF] rounded-full animate-pulse" />
                <span className="w-1 h-10 bg-[#F328D5] rounded-full animate-pulse delay-75" />
                <span className="w-1 h-5 bg-[#FFC84A] rounded-full animate-pulse delay-150" />
              </div>
              <div className="absolute -right-10 flex items-center gap-1 opacity-70">
                <span className="w-1 h-5 bg-[#FFC84A] rounded-full animate-pulse delay-150" />
                <span className="w-1 h-10 bg-[#F328D5] rounded-full animate-pulse delay-75" />
                <span className="w-1 h-6 bg-[#8B20FF] rounded-full animate-pulse" />
              </div>
            </div>

            {/* Royal Golden Crown sitting atop host avatar frame */}
            <div className="relative -mb-3 z-20 animate-bounce">
              <div className="text-2xl sm:text-3xl filter drop-shadow-[0_0_12px_#FFC84A]">
                👑
              </div>
            </div>

            {/* Circular Host Avatar with Royal Glowing Border */}
            <div 
              onClick={(e) => {
                e.stopPropagation();
                onSelectUser(room.host || MOCK_USERS.queen_girl);
              }}
              className="relative cursor-pointer group active:scale-95 transition-transform"
            >
              {/* Dynamic Speaking Aura */}
              <div className={`absolute -inset-2.5 rounded-full bg-gradient-to-tr from-[#FFC84A] via-[#F328D5] to-[#8B20FF] transition-all duration-300 ${
                isHostSpeaking 
                  ? 'opacity-100 blur-md animate-pulse ring-4 ring-[#F328D5]/50' 
                  : 'opacity-40 blur-sm'
              }`} />

              {/* Host Avatar Frame */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-gradient-to-tr from-[#FFC84A] via-[#F328D5] to-[#8B20FF] shadow-2xl">
                <img
                  src={room.host.avatar || MOCK_USERS.queen_girl.avatar}
                  alt={room.host.name || 'Queen Girl'}
                  className="w-full h-full rounded-full object-cover ring-2 ring-[#080413]"
                />
              </div>

              {/* Host Stage Base / Pedestal Curve */}
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-4 bg-gradient-to-r from-transparent via-[#8B20FF]/60 to-transparent blur-sm rounded-full pointer-events-none" />
            </div>

            {/* Host Name Pill underneath avatar: "Queen Girl 👑 🎙️" */}
            <div 
              onClick={(e) => {
                e.stopPropagation();
                onSelectUser(room.host || MOCK_USERS.queen_girl);
              }}
              className="mt-2.5 z-10 flex items-center gap-1.5 bg-[#160C25]/90 border border-white/15 px-3 py-1 rounded-full shadow-lg backdrop-blur-md cursor-pointer hover:border-[#F328D5] transition-colors"
            >
              <span className="text-xs font-black text-white">
                {room.host.name || 'Queen Girl 👑'}
              </span>
              <Mic className="w-3 h-3 text-[#F328D5] animate-pulse" />
            </div>
          </div>
        </section>

        {/* ========================================================
            3. SEAT GRID (Screen B Layout)
            - 8-Seat layout (2 rows of 3-4 seats, numbered 1 through 8)
            - 16-Seat layout (clean numbered grid 1 through 15)
            - Clearly numbered purple circular badges (1, 2, 3...)
            - Occupied seats show avatar, speaking glow, username, mic icon
            - Empty seats show purple circle with '+' and 'Join' label
           ======================================================== */}
        <section className="relative z-10 max-w-md mx-auto w-full my-auto py-2">
          {seatMode === 8 ? (
            /* 8-Seat Room Layout matching Screen B exactly:
               Row 1: Seat 1 (Rohan 🔥), Seat 2 (Sara ❤️), Seat 3 (King 👑)
               Row 2: Seat 4 (Angel 😎), Seat 5 (Mr. Khan ✌️), Seat 6 (Pink Girl 💕)
               Row 3: Seat 7 (Empty + Join), Seat 8 (Empty + Join)
            */
            <div className="space-y-3">
              {/* Row 1: Seats 1, 2, 3 */}
              <div className="grid grid-cols-3 gap-3 justify-items-center">
                {seats.slice(0, 3).map((user, idx) => (
                  <SeatItem
                    key={idx}
                    index={idx + 1}
                    user={user}
                    isSpeaking={speakingIndex === idx + 1}
                    onJoin={() => handleJoinSeat(idx)}
                    onSelect={() => user && onSelectUser(user)}
                  />
                ))}
              </div>

              {/* Row 2: Seats 4, 5, 6 */}
              <div className="grid grid-cols-3 gap-3 justify-items-center">
                {seats.slice(3, 6).map((user, idx) => (
                  <SeatItem
                    key={idx + 3}
                    index={idx + 4}
                    user={user}
                    isSpeaking={speakingIndex === idx + 4}
                    onJoin={() => handleJoinSeat(idx + 3)}
                    onSelect={() => user && onSelectUser(user)}
                  />
                ))}
              </div>

              {/* Row 3: Seats 7, 8 (Empty + Join slots) */}
              <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto justify-items-center pt-0.5">
                {seats.slice(6, 8).map((user, idx) => (
                  <SeatItem
                    key={idx + 6}
                    index={idx + 7}
                    user={user}
                    isSpeaking={speakingIndex === idx + 7}
                    onJoin={() => handleJoinSeat(idx + 6)}
                    onSelect={() => user && onSelectUser(user)}
                    isWideEmptySlot={true}
                  />
                ))}
              </div>
            </div>
          ) : (
            /* 16-Seat Room Grid (Numbered 1 through 15) */
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5 justify-items-center">
              {seats.map((user, idx) => (
                <SeatItem
                  key={idx}
                  index={idx + 1}
                  user={user}
                  isSpeaking={speakingIndex === idx + 1}
                  onJoin={() => handleJoinSeat(idx)}
                  onSelect={() => user && onSelectUser(user)}
                  compact={true}
                />
              ))}
            </div>
          )}
        </section>

        {/* ========================================================
            4. ROOM CHAT STREAM (Screen B Chat)
            - Clean list below seats
            - Rohan Kumar: "Nice Room! ❤️"
            - Sara: "Love this room! 😍"
            - King: "Welcome everyone! 👏"
           ======================================================== */}
        <section className="relative z-20 max-w-md mx-auto w-full px-2 max-h-24 overflow-y-auto no-scrollbar space-y-1.5 my-1 pointer-events-auto">
          {roomMessages.map((msg) => (
            <div 
              key={msg.id} 
              className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-2xl w-fit max-w-[95%] border border-white/5 animate-fade-in"
            >
              <img
                src={msg.avatar}
                alt={msg.name}
                className="w-5 h-5 rounded-full object-cover shrink-0 ring-1 ring-white/20"
              />
              <div className="flex items-baseline gap-1.5 text-xs truncate">
                <span className="font-bold text-white/95 shrink-0">
                  {msg.name}
                </span>
                <span className="text-white/80 font-normal">
                  {msg.text}
                </span>
              </div>
            </div>
          ))}
          <div ref={chatBottomRef} />
        </section>
      </main>

      {/* ========================================================
          5. BOTTOM CONTROL BAR (Screen B Controls)
          - Mic (icon + "Mic" label)
          - Speaker (icon + "Speaker" label)
          - Central prominent glowing Gift button 🎁 (large pink box + "Gift")
          - Share (icon + "Share" label)
          - More (icon + "More" label)
         ======================================================== */}
      <footer 
        onClick={(e) => e.stopPropagation()}
        className="relative z-30 px-4 py-3 pb-safe bg-[#080413]/95 border-t border-white/[0.08] backdrop-blur-xl"
      >
        <div className="flex items-center justify-between max-w-md mx-auto">
          {/* 1. Mic Button */}
          <button
            onClick={() => {
              setIsMicMuted(!isMicMuted);
              showToast(isMicMuted ? 'Microphone enabled 🎙️' : 'Microphone muted 🔇');
            }}
            className="flex flex-col items-center justify-center gap-1 text-[#B9AECF] hover:text-white transition-colors active:scale-95 group w-14"
          >
            <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
              isMicMuted ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-white/10 text-white group-hover:bg-white/15'
            }`}>
              {isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </div>
            <span className="text-[10px] font-semibold tracking-tight">Mic</span>
          </button>

          {/* 2. Speaker Button */}
          <button
            onClick={() => {
              setIsSpeakerMuted(!isSpeakerMuted);
              showToast(isSpeakerMuted ? 'Speaker enabled 🔊' : 'Speaker muted 🔈');
            }}
            className="flex flex-col items-center justify-center gap-1 text-[#B9AECF] hover:text-white transition-colors active:scale-95 group w-14"
          >
            <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
              isSpeakerMuted ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-white/10 text-white group-hover:bg-white/15'
            }`}>
              {isSpeakerMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </div>
            <span className="text-[10px] font-semibold tracking-tight">Speaker</span>
          </button>

          {/* 3. Center Glowing Prominent GIFT Button 🎁 matching Screen B */}
          <button
            onClick={() => onOpenGiftShop(room.host || MOCK_USERS.queen_girl)}
            className="relative -top-2 flex flex-col items-center justify-center active:scale-95 transition-transform group"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#8B20FF] via-[#F328D5] to-[#FFC84A] flex items-center justify-center text-white shadow-[0_0_25px_rgba(243,40,213,0.65)] ring-2 ring-white/30 group-hover:scale-105 transition-all">
              <Gift className="w-7 h-7 text-white stroke-[2.2]" />
            </div>
            <span className="text-[10px] font-bold text-[#FFC84A] mt-1 tracking-tight">Gift</span>
          </button>

          {/* 4. Share Button */}
          <button
            onClick={() => showToast('Party room link copied to clipboard! 📋')}
            className="flex flex-col items-center justify-center gap-1 text-[#B9AECF] hover:text-white transition-colors active:scale-95 group w-14"
          >
            <div className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center text-white">
              <Share2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-semibold tracking-tight">Share</span>
          </button>

          {/* 5. More Button */}
          <button
            onClick={() => setShowRoomDetails(!showRoomDetails)}
            className="flex flex-col items-center justify-center gap-1 text-[#B9AECF] hover:text-white transition-colors active:scale-95 group w-14"
          >
            <div className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center text-white">
              <MoreVertical className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-semibold tracking-tight">More</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

// Reusable Seat Item Component
interface SeatItemProps {
  index: number;
  user: UserProfile | null;
  isSpeaking: boolean;
  onJoin: () => void;
  onSelect: () => void;
  compact?: boolean;
  isWideEmptySlot?: boolean;
}

const SeatItem: React.FC<SeatItemProps> = ({
  index,
  user,
  isSpeaking,
  onJoin,
  onSelect,
  compact = false,
  isWideEmptySlot = false,
}) => {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        if (user) {
          onSelect();
        } else {
          onJoin();
        }
      }}
      className={`relative flex flex-col items-center text-center cursor-pointer active:scale-95 transition-all ${
        isWideEmptySlot ? 'w-28' : compact ? 'w-16' : 'w-20'
      }`}
    >
      {/* Numbered purple circular badge at top-left of seat */}
      <span className="absolute -top-1 left-1 z-20 w-4 h-4 rounded-full bg-[#8B20FF] text-white text-[9px] font-black flex items-center justify-center shadow-md border border-white/20">
        {index}
      </span>

      {user ? (
        /* Occupied Seat */
        <div className="relative mb-1">
          {/* Speaking animation ring */}
          <div className={`absolute -inset-1 rounded-full transition-all ${
            isSpeaking 
              ? 'bg-gradient-to-tr from-[#8B20FF] via-[#F328D5] to-[#FFC84A] opacity-100 blur-sm animate-pulse ring-2 ring-[#F328D5]' 
              : 'opacity-0'
          }`} />

          {/* User Avatar */}
          <div className={`relative rounded-full overflow-hidden p-[2px] bg-[#211333] border border-white/20 shadow-md ${
            compact ? 'w-12 h-12' : 'w-14 h-14 sm:w-16 sm:h-16'
          }`}>
            <img
              src={user.avatar}
              alt={user.name}
              className="w-full h-full rounded-full object-cover ring-1 ring-[#080413]"
            />
          </div>

          {/* Mic icon indicator */}
          <span className={`absolute -bottom-0.5 -right-0.5 p-1 rounded-full border border-[#080413] shadow ${
            isSpeaking ? 'bg-[#F328D5] text-white animate-pulse' : 'bg-[#160C25] text-[#B9AECF]'
          }`}>
            <Mic className="w-2.5 h-2.5" />
          </span>
        </div>
      ) : (
        /* Empty Seat (+ Join) matching Screen B */
        <div className={`rounded-full flex items-center justify-center transition-all mb-1 ${
          isWideEmptySlot 
            ? 'w-14 h-14 sm:w-16 sm:h-16 bg-[#160C25]/90 border-2 border-dashed border-[#8B20FF]/60 hover:border-[#F328D5] shadow-[0_0_15px_rgba(139,32,255,0.25)]' 
            : compact
            ? 'w-12 h-12 bg-[#160C25]/80 border-2 border-dashed border-white/20 hover:border-[#8B20FF]'
            : 'w-14 h-14 sm:w-16 sm:h-16 bg-[#160C25]/80 border-2 border-dashed border-white/20 hover:border-[#8B20FF]'
        }`}>
          <div className="w-8 h-8 rounded-full bg-[#8B20FF]/30 flex items-center justify-center text-white">
            <Plus className="w-5 h-5 text-purple-200 stroke-[2.5]" />
          </div>
        </div>
      )}

      {/* Label: User Name or "Join" */}
      <span className={`font-bold truncate max-w-full leading-tight ${
        user ? 'text-white text-xs' : 'text-[#8B20FF] text-xs font-black'
      }`}>
        {user ? user.name.split(' ')[0] : 'Join'}
      </span>
      {user && (
        <span className="text-[10px] text-[#B9AECF] truncate max-w-full">
          {user.name.split(' ')[1] || 'Guest'}
        </span>
      )}
    </div>
  );
};
