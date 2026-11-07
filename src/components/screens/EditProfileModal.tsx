import React, { useState, useRef } from 'react';
import { 
  X, 
  Camera, 
  Upload, 
  Check, 
  AlertCircle, 
  Lock, 
  RefreshCw, 
  Sparkles, 
  User, 
  AtSign, 
  Globe, 
  Calendar,
  Image as ImageIcon
} from 'lucide-react';
import { UserProfile } from '../../types';
import { AvatarWithFrame } from '../common/AvatarWithFrame';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSaveProfile: (updatedProfile: UserProfile) => Promise<void> | void;
}

// Curated high-resolution avatar presets for rapid selection
const AVATAR_PRESETS = [
  {
    id: 'preset_1',
    label: 'Glamour Star',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'preset_2',
    label: 'Neon Singer',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'preset_3',
    label: 'Pink Aura',
    url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'preset_4',
    label: 'Cyber Host',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'preset_5',
    label: 'EDM DJ',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'preset_6',
    label: 'Esports Pro',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
  },
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSaveProfile,
}) => {
  // Form State
  const [displayName, setDisplayName] = useState(currentUser.name || '');
  const [username, setUsername] = useState(currentUser.username || '@queensara');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatar || '');
  const [gender, setGender] = useState<'female' | 'male' | 'other' | 'unspecified'>(
    currentUser.gender || 'female'
  );
  const [country, setCountry] = useState(currentUser.country || 'Pakistan');
  const [birthday, setBirthday] = useState(currentUser.birthday || '2001-08-14');

  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPresets, setShowPresets] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle image upload from user device (Android, iOS, Web)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: max 5MB
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Selected image is too large. Please select an image under 5MB.');
      return;
    }

    // Check image type
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid image file (PNG, JPG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setAvatarUrl(dataUrl);
        setErrorMessage(null);
      }
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read image file from your device. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleResetToDefaultAvatar = () => {
    setAvatarUrl('');
    setErrorMessage(null);
  };

  const validateInputs = (): boolean => {
    setErrorMessage(null);

    const trimmedName = displayName.trim();
    if (!trimmedName) {
      setErrorMessage('Display Name cannot be empty.');
      return false;
    }
    if (trimmedName.length < 2 || trimmedName.length > 30) {
      setErrorMessage('Display Name must be between 2 and 30 characters.');
      return false;
    }

    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      setErrorMessage('Username cannot be empty.');
      return false;
    }
    // Check username pattern: alphanumeric with optional underscore, leading @
    const cleanUsername = trimmedUsername.startsWith('@') ? trimmedUsername.slice(1) : trimmedUsername;
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(cleanUsername)) {
      setErrorMessage('Username must be 3-20 characters long and contain only letters, numbers, and underscores.');
      return false;
    }

    if (bio.length > 200) {
      setErrorMessage('Bio must not exceed 200 characters.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const formattedUsername = username.startsWith('@') ? username : `@${username}`;
      const updatedProfile: UserProfile = {
        ...currentUser,
        name: displayName.trim(),
        username: formattedUsername.trim(),
        bio: bio.trim(),
        avatar: avatarUrl || '',
        gender,
        country,
        birthday,
      };

      // Call save handler
      await onSaveProfile(updatedProfile);

      setIsLoading(false);
      setSuccessMessage('Profile updated successfully!');

      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1200);
    } catch (err) {
      setIsLoading(false);
      setErrorMessage('An error occurred while saving your profile. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div
        className="w-full max-w-lg bg-[#160C25] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-4 sm:p-5 pb-3 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#8B20FF] to-[#F328D5] flex items-center justify-center text-white shadow-md shadow-[#F328D5]/20">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">Edit Profile</h3>
              <p className="text-[11px] text-[#B9AECF]">Update your public photo and identity details</p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-8 h-8 rounded-full bg-[#211333] hover:bg-[#2e1a47] flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Banner */}
        {successMessage && (
          <div className="mx-4 mt-3 p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-bounce">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Banner */}
        {errorMessage && (
          <div className="mx-4 mt-3 p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto no-scrollbar flex-1 space-y-5">
          {/* 1. Profile Picture (DP) Section */}
          <div className="flex flex-col items-center p-4 rounded-2xl bg-[#211333] border border-white/5">
            <div className="relative mb-3">
              <AvatarWithFrame
                src={avatarUrl}
                name={displayName}
                level={currentUser.level}
                vipLevel={currentUser.vipLevel}
                isVIP={currentUser.isVIP}
                size="xl"
                showFrame={true}
                showVipBadge={true}
              />

              {/* Upload Trigger Badge */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-gradient-to-tr from-[#8B20FF] to-[#F328D5] text-white flex items-center justify-center shadow-lg shadow-[#F328D5]/50 ring-2 ring-[#160C25] hover:scale-110 active:scale-95 transition-transform"
                title="Upload Photo"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* Hidden Native File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-[#FFC84A]" />
                <span>Upload Photo</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPresets(!showPresets)}
                className="px-3 py-1.5 rounded-xl bg-[#160C25] hover:bg-[#28173e] text-[#B9AECF] hover:text-white border border-white/10 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#F328D5]" />
                <span>Avatar Presets</span>
              </button>

              {avatarUrl && (
                <button
                  type="button"
                  onClick={handleResetToDefaultAvatar}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold transition-colors"
                >
                  Reset DP
                </button>
              )}
            </div>

            {/* Presets Gallery Drawer */}
            {showPresets && (
              <div className="w-full mt-4 pt-3 border-t border-white/10 animate-fade-in">
                <span className="text-[11px] font-bold text-[#B9AECF] block mb-2 text-center">
                  Select a Curated Avatar Preset:
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {AVATAR_PRESETS.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        setAvatarUrl(p.url);
                        setShowPresets(false);
                      }}
                      className={`group relative rounded-xl overflow-hidden aspect-square border cursor-pointer transition-all ${
                        avatarUrl === p.url
                          ? 'border-[#F328D5] ring-2 ring-[#F328D5] scale-105'
                          : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                      {avatarUrl === p.url && (
                        <div className="absolute inset-0 bg-[#F328D5]/40 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white stroke-[3]" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 2. Protected User ID Display (Cannot be modified) */}
          <div className="p-3.5 rounded-2xl bg-[#090611] border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-[#FFC84A]" />
              <div className="flex flex-col">
                <span className="text-[10px] text-[#B9AECF] font-bold uppercase tracking-wider">
                  Unique User ID (Protected)
                </span>
                <span className="text-sm font-mono font-bold text-white tracking-wide">
                  {currentUser.displayId}
                </span>
              </div>
            </div>
            <span className="text-[10px] bg-white/10 text-white/80 px-2 py-0.5 rounded-full font-mono">
              Non-Editable
            </span>
          </div>

          {/* 3. Display Name */}
          <div>
            <label className="block text-xs font-bold text-white mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#F328D5]" />
              <span>Display Name *</span>
            </label>
            <input
              type="text"
              value={displayName}
              maxLength={30}
              placeholder="Enter your public display name"
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-[#211333] border border-white/10 focus:border-[#F328D5] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-[#B9AECF]/50 outline-none transition-colors"
            />
            <span className="text-[10px] text-[#B9AECF] mt-1 block">
              2 to 30 characters. This is the name shown in live broadcasts and party rooms.
            </span>
          </div>

          {/* 4. Username / Handle */}
          <div>
            <label className="block text-xs font-bold text-white mb-1.5 flex items-center gap-1.5">
              <AtSign className="w-3.5 h-3.5 text-[#8B20FF]" />
              <span>Username Handle *</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                maxLength={21}
                placeholder="@username"
                onChange={(e) => {
                  let val = e.target.value;
                  if (!val.startsWith('@') && val.length > 0) val = `@${val}`;
                  setUsername(val);
                }}
                className="w-full bg-[#211333] border border-white/10 focus:border-[#8B20FF] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white font-mono placeholder-[#B9AECF]/50 outline-none transition-colors"
              />
            </div>
            <span className="text-[10px] text-[#B9AECF] mt-1 block">
              Unique handle used for mentions and direct message searches.
            </span>
          </div>

          {/* 5. Bio Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-white">Bio / Profile Description</label>
              <span className={`text-[10px] font-mono ${bio.length > 180 ? 'text-amber-400' : 'text-[#B9AECF]'}`}>
                {bio.length}/200
              </span>
            </div>
            <textarea
              rows={3}
              maxLength={200}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell your fans and party friends about yourself..."
              className="w-full bg-[#211333] border border-white/10 focus:border-[#F328D5] rounded-xl p-3 text-xs text-white placeholder-[#B9AECF]/50 outline-none resize-none transition-colors leading-relaxed"
            />
          </div>

          {/* 6. Gender & Country Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-white mb-1.5">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full bg-[#211333] border border-white/10 focus:border-[#F328D5] rounded-xl px-3 py-2.5 text-xs text-white outline-none cursor-pointer"
              >
                <option value="female" className="bg-[#160C25]">Female</option>
                <option value="male" className="bg-[#160C25]">Male</option>
                <option value="other" className="bg-[#160C25]">Other</option>
                <option value="unspecified" className="bg-[#160C25]">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-white mb-1.5 flex items-center gap-1">
                <Globe className="w-3 h-3 text-[#06B6D4]" />
                <span>Country / Region</span>
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-[#211333] border border-white/10 focus:border-[#06B6D4] rounded-xl px-3 py-2.5 text-xs text-white outline-none cursor-pointer"
              >
                <option value="Pakistan" className="bg-[#160C25]">Pakistan</option>
                <option value="United States" className="bg-[#160C25]">United States</option>
                <option value="United Arab Emirates" className="bg-[#160C25]">United Arab Emirates</option>
                <option value="Saudi Arabia" className="bg-[#160C25]">Saudi Arabia</option>
                <option value="United Kingdom" className="bg-[#160C25]">United Kingdom</option>
                <option value="India" className="bg-[#160C25]">India</option>
                <option value="Turkey" className="bg-[#160C25]">Turkey</option>
                <option value="Canada" className="bg-[#160C25]">Canada</option>
              </select>
            </div>
          </div>
        </form>

        {/* Footer Buttons */}
        <div className="p-4 bg-[#160C25] border-t border-white/[0.08] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#8B20FF] via-[#F328D5] to-[#FFC84A] text-white text-xs font-extrabold shadow-lg shadow-[#F328D5]/30 hover:opacity-95 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
