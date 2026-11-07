import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Camera, 
  ChevronDown, 
  Users, 
  Globe, 
  Lock, 
  Key, 
  Radio, 
  Sparkles 
} from 'lucide-react';
import { PartyRoom, UserProfile } from '../../types';

interface CreateRoomScreenProps {
  currentUser: UserProfile;
  onClose: () => void;
  onCreateRoom: (newRoom: PartyRoom) => void;
}

export const CreateRoomScreen: React.FC<CreateRoomScreenProps> = ({
  currentUser,
  onClose,
  onCreateRoom,
}) => {
  const [roomName, setRoomName] = useState('');
  const [category, setCategory] = useState<'Party' | 'Music' | 'Game' | 'Chat' | 'Love' | 'Dance'>('Music');
  const [roomType, setRoomType] = useState<'public' | 'private' | 'secret'>('public');
  const [maxSeats, setMaxSeats] = useState<number>(8);
  const [announcement, setAnnouncement] = useState('Welcome everyone! Grab a mic or chill in the audience! 🎶');
  const [coverUrl, setCoverUrl] = useState(
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80'
  );
  const [error, setError] = useState<string | null>(null);

  const sampleCovers = [
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop&q=80',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) {
      setError('Please enter a room name');
      return;
    }

    const newRoom: PartyRoom = {
      id: `room_${Date.now()}`,
      title: roomName.trim(),
      category,
      host: currentUser,
      coverImage: coverUrl,
      iconType: category === 'Music' ? 'mic' : category === 'Game' ? 'game' : category === 'Love' ? 'lips' : 'heart',
      participantCount: '1',
      numericParticipants: 1,
      isAudioRoom: true,
      maxSeats,
      roomType,
      announcement,
      seats: [null, null, null, null, null, null, null, null],
    };

    onCreateRoom(newRoom);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#090611] flex flex-col justify-between p-4 sm:p-6 select-none animate-fade-in">
      <div className="max-w-lg mx-auto w-full">
        {/* Header Bar matching reference image */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#160C25] hover:bg-[#211333] border border-white/10 flex items-center justify-center text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h2 className="text-lg font-bold text-white font-display">Create Room</h2>
          <div className="w-9" /> {/* Spacer */}
        </div>

        {error && (
          <div className="bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs py-2 px-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        {/* Upload Cover Container matching reference */}
        <div className="relative mb-5">
          <label className="block text-xs font-bold text-white mb-2">Upload Cover</label>
          <div className="relative h-40 rounded-2xl overflow-hidden border border-dashed border-white/20 hover:border-[#8B20FF] bg-[#160C25] group cursor-pointer">
            <img
              src={coverUrl}
              alt="Room Cover"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover filter brightness-75 group-hover:scale-105 transition-transform"
            />
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white">
              <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Camera className="w-6 h-6 text-[#FFC84A]" />
              </div>
              <span className="text-xs font-bold">Upload Room Artwork</span>
            </div>
          </div>

          {/* Quick preset cover picker */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] text-[#B9AECF]">Presets:</span>
            {sampleCovers.map((c, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCoverUrl(c)}
                className={`w-7 h-7 rounded-lg overflow-hidden border ${coverUrl === c ? 'ring-2 ring-[#8B20FF]' : 'border-white/20'}`}
              >
                <img src={c} alt="cover" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Room Settings Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-white mb-1.5">Room Name *</label>
            <input
              type="text"
              placeholder="Enter Room Name... (e.g. VIP Music Jam)"
              value={roomName}
              onChange={(e) => {
                setRoomName(e.target.value);
                if (error) setError(null);
              }}
              className="w-full bg-[#160C25] border border-white/10 focus:border-[#8B20FF] rounded-xl px-4 py-3 text-sm text-white placeholder-[#B9AECF]/50 outline-none transition-colors"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-bold text-white mb-1.5">Select Category</label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full appearance-none bg-[#160C25] border border-white/10 focus:border-[#8B20FF] rounded-xl px-4 py-3 text-sm text-white outline-none cursor-pointer"
              >
                <option value="Music" className="bg-[#160C25] text-white">Music Party</option>
                <option value="Dance" className="bg-[#160C25] text-white">Dance Room</option>
                <option value="Game" className="bg-[#160C25] text-white">Gaming Room</option>
                <option value="Party" className="bg-[#160C25] text-white">Fun Party</option>
                <option value="Chat" className="bg-[#160C25] text-white">Chat Room</option>
                <option value="Love" className="bg-[#160C25] text-white">Love Room</option>
              </select>
              <ChevronDown className="w-4 h-4 text-[#B9AECF] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Room Type Selector matching reference: Public, Private, Secret */}
          <div>
            <label className="block text-xs font-bold text-white mb-2">Room Type</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'public', label: 'Public', icon: Globe },
                { id: 'private', label: 'Private', icon: Lock },
                { id: 'secret', label: 'Secret', icon: Key },
              ].map((t) => {
                const Icon = t.icon;
                const isSelected = roomType === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setRoomType(t.id as any)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#8B20FF] to-[#F328D5] text-white border-[#F328D5] shadow-md shadow-[#F328D5]/20'
                        : 'bg-[#160C25] text-[#B9AECF] border-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Seat Layout Selector: 8-seat room option & 16-seat room option */}
          <div>
            <label className="block text-xs font-bold text-white mb-1.5">Room Capacity (Seats)</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { count: 8, label: '8 Seats', desc: '1 Host + 7 Members' },
                { count: 16, label: '16 Seats', desc: '1 Host + 15 Members' }
              ].map((opt) => (
                <button
                  key={opt.count}
                  type="button"
                  onClick={() => setMaxSeats(opt.count)}
                  className={`p-3 rounded-2xl text-left border transition-all ${
                    maxSeats === opt.count
                      ? 'bg-gradient-to-r from-[#8B20FF] to-[#F328D5] text-white border-[#F328D5] shadow-lg shadow-[#F328D5]/30'
                      : 'bg-[#160C25] text-[#B9AECF] border-white/10 hover:text-white hover:border-white/20'
                  }`}
                >
                  <div className="text-sm font-black">{opt.label}</div>
                  <div className="text-[10px] opacity-80 mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Room Announcement */}
          <div>
            <label className="block text-xs font-bold text-white mb-1.5">Room Announcement</label>
            <textarea
              rows={2}
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              placeholder="Describe your party room rules or topic..."
              className="w-full bg-[#160C25] border border-white/10 focus:border-[#8B20FF] rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#B9AECF]/50 outline-none resize-none transition-colors"
            />
          </div>

          {/* Create Room Button matching reference */}
          <div className="pt-3">
            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-gradient-to-r from-[#8B20FF] via-[#F328D5] to-[#FFC84A] text-white font-extrabold text-sm shadow-xl shadow-[#8B20FF]/30 hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <span>Create Room</span>
              <Sparkles className="w-4 h-4 text-[#FFC84A]" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
