import React, { useState } from 'react';
import { 
  Settings, 
  Share2, 
  Crown, 
  Wallet, 
  ChevronRight, 
  Edit3, 
  Copy, 
  Check, 
  Coins, 
  Plus, 
  Play,
  Trash2,
  X,
  Heart,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { UserProfile, ScreenType, VideoItem } from '../../types';
import { AvatarWithFrame } from '../common/AvatarWithFrame';
import { LevelBadge } from '../common/LevelBadge';
import { COIN_CONFIG } from '../../utils/coinConfig';
import { getUserLevelProgress } from '../../utils/levelSystem';
import { EditProfileModal } from './EditProfileModal';

interface ProfileScreenProps {
  currentUser: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onNavigate: (screen: ScreenType) => void;
  onOpenWallet: () => void;
  onOpenVIP: () => void;
  userVideos?: VideoItem[];
  onSelectVideo?: (video: VideoItem) => void;
  onOpenUploadVideo?: () => void;
  onDeleteVideo?: (videoId: string) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  currentUser,
  onUpdateProfile,
  onNavigate,
  onOpenWallet,
  onOpenVIP,
  userVideos = [],
  onSelectVideo,
  onOpenUploadVideo,
  onDeleteVideo,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Video playback modal state
  const [playingVideo, setPlayingVideo] = useState<VideoItem | null>(null);
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null);

  // Local videos state to allow immediate in-screen deletion
  const [localVideos, setLocalVideos] = useState<VideoItem[]>(userVideos);

  // Sync if prop updates
  React.useEffect(() => {
    setLocalVideos(userVideos);
  }, [userVideos]);

  // Level progress calculation (purely for logged-in user's own current level)
  const levelProgress = getUserLevelProgress(currentUser);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleCopyId = () => {
    navigator.clipboard?.writeText(currentUser.displayId);
    setCopiedId(true);
    showToast(`User ID ${currentUser.displayId} copied to clipboard!`);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleShare = () => {
    showToast(`Profile link for ${currentUser.name} copied!`);
  };

  const handleDeleteVideo = (videoId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setLocalVideos((prev) => prev.filter((v) => v.id !== videoId));
    if (onDeleteVideo) onDeleteVideo(videoId);
    if (playingVideo?.id === videoId) setPlayingVideo(null);
    setVideoToDelete(null);
    showToast('Video removed successfully');
  };

  return (
    <div className="w-full pb-24 sm:pb-14 animate-fade-in select-none bg-[#090611] min-h-screen text-white">
      <div className="max-w-xl mx-auto px-4 pt-3 space-y-4">
        
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#8B20FF] text-white text-xs font-bold py-2 px-4 rounded-full shadow-lg shadow-[#8B20FF]/50 animate-bounce">
            {toastMessage}
          </div>
        )}

        {/* Dedicated Edit Profile Modal */}
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          currentUser={currentUser}
          onSaveProfile={(updated) => {
            onUpdateProfile(updated);
            showToast('Profile updated successfully!');
          }}
        />

        {/* Delete Confirmation Modal */}
        {videoToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-xs bg-[#160C25] border border-white/10 rounded-3xl p-5 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
                <Trash2 className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">Delete this video?</h4>
              <p className="text-xs text-[#B9AECF]">This action cannot be undone.</p>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setVideoToDelete(null)}
                  className="flex-1 py-2 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/15"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteVideo(videoToDelete)}
                  className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Video Player Modal */}
        {playingVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fade-in">
            <div className="relative w-full max-w-sm bg-[#160C25] border border-white/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
              {/* Video Header with close and delete */}
              <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between">
                <span className="text-xs font-bold text-white px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                  {playingVideo.createdAt}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setVideoToDelete(playingVideo.id)}
                    className="w-8 h-8 rounded-full bg-red-600/80 hover:bg-red-600 flex items-center justify-center text-white transition-colors"
                    title="Delete Video"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPlayingVideo(null)}
                    className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Video Thumbnail View */}
              <div className="relative aspect-[9/14] w-full bg-black overflow-hidden flex items-center justify-center">
                <img
                  src={playingVideo.thumbnailUrl || playingVideo.videoUrl}
                  alt={playingVideo.description}
                  className="w-full h-full object-cover filter brightness-95"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 pointer-events-none" />

                {/* Animated Play icon */}
                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-xl animate-pulse">
                  <Play className="w-7 h-7 fill-white ml-1" />
                </div>
              </div>

              {/* Video Details Footer */}
              <div className="p-4 bg-[#160C25] space-y-2">
                <p className="text-xs text-white leading-relaxed font-medium">
                  {playingVideo.description}
                </p>
                <div className="flex items-center justify-between pt-1 text-xs text-[#B9AECF]">
                  <span className="flex items-center gap-1 text-pink-400 font-bold">
                    <Heart className="w-3.5 h-3.5 fill-pink-500" />
                    <span>{playingVideo.likesCount.toLocaleString()} Likes</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{playingVideo.commentsCount.toLocaleString()} Comments</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top Header Utilities Bar */}
        <header className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-white tracking-tight font-display">
              My Profile
            </span>
            <LevelBadge level={currentUser.level} size="xs" />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="w-9 h-9 rounded-full bg-[#160C25] hover:bg-[#211333] border border-white/10 flex items-center justify-center text-white transition-colors active:scale-95"
              title="Share Profile"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('settings')}
              className="w-9 h-9 rounded-full bg-[#160C25] hover:bg-[#211333] border border-white/10 flex items-center justify-center text-white transition-colors active:scale-95"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* ========================================================
            1. PRIMARY CLEAN PROFILE IDENTITY CARD
            - User Profile Picture (DP) with edit photo action
            - Display Name & Verified badge
            - Small attractive level badge beside username
            - User ID with copy button
            - Current user's own level number clearly displayed
            - Clean minimal progress bar (without displaying entire ladder)
            - Edit Profile Button
           ======================================================== */}
        <div className="relative p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-[#1c0e33] via-[#160C25] to-[#12091f] border border-white/10 shadow-xl overflow-hidden flex flex-col items-center text-center">
          
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-l from-[#F328D5]/15 via-[#8B20FF]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

          {/* User Profile Picture (DP) */}
          <div className="relative mb-3">
            <AvatarWithFrame
              src={currentUser.avatar}
              name={currentUser.name}
              level={currentUser.level}
              vipLevel={currentUser.vipLevel}
              isVIP={currentUser.isVIP}
              size="xl"
              showFrame={true}
              showVipBadge={false}
              onClick={() => setIsEditModalOpen(true)}
            />
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="absolute -bottom-1 -right-1 bg-gradient-to-tr from-[#8B20FF] to-[#F328D5] text-white p-1.5 rounded-full shadow-lg ring-2 ring-[#090611] hover:scale-110 active:scale-95 transition-transform"
              title="Edit Profile"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Display Name with Verified Checkmark & Level Badge beside it */}
          <div className="flex items-center justify-center gap-1.5 mb-1 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight">
              {currentUser.name}
            </h2>
            <div className="w-4 h-4 rounded-full bg-[#06B6D4] text-white flex items-center justify-center text-[10px] font-black shrink-0" title="Verified Creator">
              ✓
            </div>
            <LevelBadge level={currentUser.level} size="xs" />
          </div>

          {/* Unique User ID with Copy Button */}
          <button
            onClick={handleCopyId}
            className="flex items-center gap-1.5 text-xs text-[#B9AECF] hover:text-white mb-3 transition-colors font-mono"
            title="Copy Unique ID"
          >
            <span>ID: {currentUser.displayId}</span>
            {copiedId ? (
              <Check className="w-3 h-3 text-emerald-400" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>

          {/* Current Personal Level Display (Shows only user's own current level) */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#FFC84A] to-[#F59E0B] text-[#090611] text-xs font-black shadow-md">
              <Crown className="w-3.5 h-3.5 fill-current" />
              <span>Level {currentUser.level}</span>
            </div>
          </div>

          {/* Clean Personal Level Progress (Level 42 • 68% to next level, without entire ladder) */}
          <div className="w-full max-w-xs px-2 mb-4">
            <div className="flex items-center justify-between text-[11px] font-bold text-white mb-1">
              <span className="text-[#FFC84A]">Level {currentUser.level}</span>
              <span className="text-[#B9AECF] font-mono">{levelProgress.progressPercent}% to next level</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-black/50 overflow-hidden border border-white/10">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-[#FFC84A] via-[#F328D5] to-[#8B20FF] transition-all duration-500 shadow-sm shadow-[#FFC84A]/30"
                style={{ width: `${Math.max(5, levelProgress.progressPercent)}%` }}
              />
            </div>
          </div>

          {/* Prominent Edit Profile Button */}
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="w-full max-w-xs py-2.5 rounded-full bg-gradient-to-r from-[#8B20FF] via-[#a825e6] to-[#F328D5] hover:opacity-95 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-[#F328D5]/25 flex items-center justify-center gap-2 active:scale-98 transition-all"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* ========================================================
            2. COIN BALANCE CARD
            - Clear coin balance
            - Quick access to recharge in wallet
           ======================================================== */}
        <div
          onClick={onOpenWallet}
          className="p-4 rounded-2xl bg-gradient-to-br from-[#1d1033] to-[#24133f] border border-[#FFC84A]/30 hover:border-[#FFC84A]/60 shadow-lg cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-[#B9AECF] flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-[#FFC84A]" />
              <span>Available Coin Balance</span>
            </span>
            <div className="flex items-center gap-1 text-[11px] text-[#FFC84A] font-bold group-hover:underline">
              <span>Recharge</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-[#FFC84A] font-mono tracking-tight">
              🪙 {currentUser.coins.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-emerald-400 font-mono">
              {COIN_CONFIG.formatPkrEquivalent(currentUser.coins)}
            </span>
          </div>
        </div>

        {/* ========================================================
            3. MY VIDEOS SECTION
            - Clean video grid showing actual uploaded videos
            - Video thumbnails with like counter
            - Tap to open and play video
            - Delete / manage button on videos
            - Add / upload video button
           ======================================================== */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2 font-display">
              <span>Uploaded Videos</span>
              <span className="text-xs text-[#B9AECF] font-mono font-normal">
                ({localVideos.length})
              </span>
            </h3>

            {onOpenUploadVideo && (
              <button
                onClick={onOpenUploadVideo}
                className="px-3 py-1 rounded-full bg-gradient-to-r from-[#8B20FF] to-[#F328D5] text-white text-xs font-bold flex items-center gap-1 shadow active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload</span>
              </button>
            )}
          </div>

          {/* Videos Grid */}
          {localVideos.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {localVideos.map((video) => (
                <div
                  key={video.id}
                  onClick={() => setPlayingVideo(video)}
                  className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#160C25] border border-white/10 hover:border-[#F328D5]/60 transition-all cursor-pointer shadow-lg flex flex-col justify-between p-2"
                >
                  {/* Thumbnail Image */}
                  <img
                    src={video.thumbnailUrl || video.videoUrl}
                    alt={video.description}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-95"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30 pointer-events-none" />

                  {/* Top: Delete Video Action */}
                  <div className="relative z-10 flex justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setVideoToDelete(video.id);
                      }}
                      className="w-7 h-7 rounded-full bg-black/60 hover:bg-red-600/90 text-white flex items-center justify-center transition-colors shadow"
                      title="Delete Video"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Center Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
                    <div className="w-10 h-10 rounded-full bg-white/25 backdrop-blur-md flex items-center justify-center text-white shadow-lg">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                  </div>

                  {/* Bottom: Title & Likes */}
                  <div className="relative z-10">
                    <p className="text-[10px] text-white font-semibold line-clamp-1 group-hover:text-pink-300 transition-colors">
                      {video.description}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-[#B9AECF] mt-0.5">
                      <span className="flex items-center gap-1 text-pink-400 font-bold">
                        <Heart className="w-3 h-3 fill-pink-500" />
                        <span>{video.likesCount.toLocaleString()}</span>
                      </span>
                      <span>{video.createdAt}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Clean Empty State */
            <div className="p-8 rounded-3xl bg-[#160C25] border border-white/10 text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#211333] flex items-center justify-center text-[#B9AECF]">
                <Play className="w-6 h-6 ml-0.5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">No uploaded videos yet</h4>
                <p className="text-xs text-[#B9AECF] mt-0.5">Upload and share your party moments with friends!</p>
              </div>
              {onOpenUploadVideo && (
                <button
                  onClick={onOpenUploadVideo}
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-[#8B20FF] to-[#F328D5] text-white text-xs font-bold shadow hover:opacity-95"
                >
                  Upload First Video
                </button>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
