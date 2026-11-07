import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Users, 
  Sparkles,
  Radio,
  Crown,
  Play
} from 'lucide-react';
import { PartyRoom, ScreenType } from '../../types';

interface RoomsScreenProps {
  partyRooms: PartyRoom[];
  onSelectRoom: (room: PartyRoom) => void;
  onNavigate: (screen: ScreenType) => void;
  onOpenCreateRoom: () => void;
  onOpenSearch: () => void;
}

export const RoomsScreen: React.FC<RoomsScreenProps> = ({
  partyRooms,
  onSelectRoom,
  onNavigate,
  onOpenCreateRoom,
  onOpenSearch,
}) => {
  // Category filter pills matching Screen C: "All Rooms", "Popular", "New", "Following"
  const [activeCategory, setActiveCategory] = useState<string>('All Rooms');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);

  const categories = ['All Rooms', 'Popular', 'New', 'Following'];

  const filteredRooms = partyRooms.filter((room) => {
    if (searchQuery) {
      return (
        room.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.host.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (activeCategory === 'All Rooms') return true;
    if (activeCategory === 'Popular') return room.numericParticipants > 5000;
    if (activeCategory === 'New') return room.id.includes('gaming') || room.id.includes('dance');
    if (activeCategory === 'Following') return room.host.isFollowing;
    return true;
  });

  return (
    <div className="w-full min-h-screen pb-28 select-none animate-fade-in bg-[#080413]">
      <div className="max-w-md md:max-w-4xl mx-auto px-4 pt-3 space-y-4">
        
        {/* ========================================================
            1. HEADER (Matching Screen C reference)
            - Crowned Lonzo Party Live Logo on left
            - Title "Lonzo Party Live" + Tagline "Party • Chat • Connect"
            - Search Icon 🔍 on right
           ======================================================== */}
        <header className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3">
            {/* Crowned Play Button Logo Icon */}
            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#FF007A] via-[#8B20FF] to-[#FFC84A] p-0.5 shadow-lg shadow-purple-600/30 flex items-center justify-center">
              <div className="w-full h-full rounded-[14px] bg-[#160C25] flex items-center justify-center relative overflow-hidden">
                <span className="absolute -top-1 text-xs">👑</span>
                <Play className="w-5 h-5 text-white fill-white ml-0.5 mt-2" />
              </div>
            </div>

            {/* App Name & Tagline */}
            <div className="flex flex-col">
              <h1 className="text-base font-extrabold text-white tracking-tight flex items-center gap-1 font-display">
                <span>Lonzo Party Live</span>
              </h1>
              <span className="text-[11px] text-[#B9AECF] font-medium tracking-tight">
                Party • Chat • Connect
              </span>
            </div>
          </div>

          {/* Search Icon */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSearchInput(!showSearchInput)}
              className="w-10 h-10 rounded-full bg-[#160C25] hover:bg-[#211333] border border-white/10 flex items-center justify-center text-white transition-colors active:scale-95 shadow"
              title="Search Rooms"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Search input field if toggled */}
        {showSearchInput && (
          <div className="relative animate-fade-in">
            <input
              type="text"
              placeholder="Search by room name or host..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#160C25] border border-white/15 focus:border-[#F328D5] rounded-2xl px-4 py-2.5 text-xs text-white placeholder-white/40 outline-none"
              autoFocus
            />
          </div>
        )}

        {/* ========================================================
            2. CATEGORY PILLS (Screen C)
            - "All Rooms" (active purple pill)
            - "Popular"
            - "New"
            - "Following"
           ======================================================== */}
        <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
                activeCategory === cat
                  ? 'bg-gradient-to-r from-[#8B20FF] to-[#F328D5] text-white shadow-md shadow-[#F328D5]/30'
                  : 'bg-[#160C25] text-[#B9AECF] hover:text-white border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </nav>

        {/* ========================================================
            3. 2-COLUMN GRID OF ROOM CARDS (Screen C)
            - Card 1: Music Room 🎵 • 👁️ 8.2K • 👥 8 / 16 • [Join]
            - Card 2: Chill Room 😎 • 👁️ 6.7K • 👥 8 / 16 • [Join]
            - Card 3: Friends Room 💕 • 👁️ 5.4K • 👥 8 / 16 • [Join]
            - Card 4: Fun Time 😊 • 👁️ 4.9K • 👥 8 / 16 • [Join]
            - Card 5: Dance Room 💃 • 👁️ 3.8K • 👥 8 / 16 • [Join]
            - Card 6: Gaming Room 🎮 • 👁️ 3.1K • 👥 8 / 16 • [Join]
           ======================================================== */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-1">
          {filteredRooms.map((room) => (
            <div
              key={room.id}
              onClick={() => onSelectRoom(room)}
              className="group relative rounded-3xl overflow-hidden bg-[#160C25] border border-white/10 hover:border-[#8B20FF]/70 transition-all duration-300 shadow-xl cursor-pointer flex flex-col active:scale-98"
            >
              {/* Photo Thumbnail Container */}
              <div className="relative aspect-[4/5] w-full overflow-hidden">
                <img
                  src={room.coverImage || room.host.coverImage || room.host.avatar}
                  alt={room.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-95"
                />

                {/* Gradient vignette for legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/60 pointer-events-none" />

                {/* Top Badges: 🔴 LIVE & 👁️ Viewer Count */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between text-xs z-10 pointer-events-none">
                  {/* Left: 🔴 LIVE Badge */}
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-600/90 text-white text-[10px] font-black uppercase tracking-wider shadow">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    LIVE
                  </span>

                  {/* Right: 👁️ Viewer Count Badge */}
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold border border-white/10">
                    <span>👁️</span>
                    <span>{room.participantCount || '8.2K'}</span>
                  </span>
                </div>

                {/* Bottom Overlay Info on Card */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 flex flex-col gap-1.5">
                  {/* Room Title */}
                  <h3 className="text-sm font-black text-white group-hover:text-pink-300 transition-colors truncate drop-shadow-md">
                    {room.title}
                  </h3>

                  {/* Capacity indicator & Join Button */}
                  <div className="flex items-center justify-between gap-1 pt-0.5">
                    {/* Capacity Indicator: 👥 8 / 16 */}
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-[#B9AECF] font-mono">
                      <span>👥</span>
                      <span>8 / 16</span>
                    </span>

                    {/* Purple "Join" Button matching Screen C */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectRoom(room);
                      }}
                      className="px-3.5 py-1 rounded-full bg-gradient-to-r from-[#8B20FF] to-[#F328D5] text-white text-xs font-bold shadow-md shadow-[#F328D5]/30 hover:opacity-95 active:scale-95 transition-all"
                    >
                      Join
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {filteredRooms.length === 0 && (
          <div className="py-16 text-center flex flex-col items-center">
            <Radio className="w-12 h-12 text-[#B9AECF]/40 mb-3" />
            <h4 className="text-base font-bold text-white mb-1">No rooms found</h4>
            <p className="text-xs text-[#B9AECF] max-w-xs mb-4">
              Be the first to start a party voice room!
            </p>
            <button
              onClick={onOpenCreateRoom}
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#8B20FF] to-[#F328D5] text-white text-xs font-bold shadow-lg"
            >
              Create Room Now
            </button>
          </div>
        )}

      </div>

      {/* ========================================================
          4. FLOATING "+ Create Room" BUTTON (Screen C)
          - Positioned right above bottom navigation bar
          - Glowing purple rounded pill button with '+' and 'Create Room'
         ======================================================== */}
      <div className="fixed bottom-16 sm:bottom-6 left-0 right-0 z-30 flex justify-center pointer-events-none">
        <button
          onClick={onOpenCreateRoom}
          className="pointer-events-auto px-6 py-2.5 rounded-full bg-gradient-to-r from-[#8B20FF] via-[#F328D5] to-[#8B20FF] text-white text-xs sm:text-sm font-black shadow-[0_4px_20px_rgba(243,40,213,0.5)] border border-white/20 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all group"
        >
          <Plus className="w-4 h-4 stroke-[3] group-hover:rotate-90 transition-transform" />
          <span>Create Room</span>
        </button>
      </div>
    </div>
  );
};
