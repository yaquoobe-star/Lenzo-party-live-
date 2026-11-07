import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Upload, 
  Video, 
  CheckCircle2, 
  Sparkles, 
  X, 
  Lock, 
  Globe, 
  Users, 
  Film,
  Play
} from 'lucide-react';
import { UserProfile, VideoItem } from '../../types';

interface UploadVideoScreenProps {
  currentUser: UserProfile;
  onClose: () => void;
  onUploadSuccess: (video: VideoItem) => void;
}

export const UploadVideoScreen: React.FC<UploadVideoScreenProps> = ({
  currentUser,
  onClose,
  onUploadSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hashtags, setHashtags] = useState<string[]>(['#fun', '#trending', '#viral']);
  const [newTagInput, setNewTagInput] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'friends' | 'private'>('public');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleAddHashtag = () => {
    if (!newTagInput.trim()) return;
    const cleanTag = newTagInput.startsWith('#') ? newTagInput.trim() : `#${newTagInput.trim()}`;
    if (!hashtags.includes(cleanTag)) {
      setHashtags([...hashtags, cleanTag]);
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    setHashtags(hashtags.filter((t) => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() && !title.trim()) {
      setErrorMessage('Please provide a title or description for your video.');
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    setUploadProgress(10);

    // Realistic upload progress simulation
    const interval = setInterval(() => {
      setUploadProgress((p) => {
        if (p >= 90) {
          clearInterval(interval);
          return 90;
        }
        return p + 25;
      });
    }, 250);

    try {
      const newVideoObj: VideoItem = {
        id: `vid_${Date.now()}`,
        creator: currentUser,
        videoUrl: previewUrl,
        thumbnailUrl: previewUrl,
        description: description.trim() || title.trim(),
        musicTitle: `${currentUser.name} - Original Sound`,
        hashtags,
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        repostsCount: 0,
        isLiked: false,
        isReposted: false,
        createdAt: 'Just now',
        privacy
      };

      // Real backend endpoint call
      const res = await fetch('/api/videos/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video: newVideoObj })
      });

      clearInterval(interval);
      setUploadProgress(100);

      setTimeout(() => {
        setIsUploading(false);
        onUploadSuccess(newVideoObj);
      }, 400);
    } catch (err: any) {
      clearInterval(interval);
      setIsUploading(false);
      setErrorMessage(err.message || 'Failed to upload video');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#090611] text-white flex flex-col justify-between p-4 sm:p-6 select-none animate-fade-in">
      {/* Header matching reference */}
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] max-w-lg mx-auto w-full pt-safe">
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-[#160C25] hover:bg-[#211333] border border-white/10 flex items-center justify-center text-white"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <h3 className="text-base font-bold text-white font-display">Upload Video</h3>

        <div className="w-9" />
      </div>

      <div className="max-w-lg mx-auto w-full flex-1 py-4 space-y-4">
        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/30 text-xs text-red-200">
            {errorMessage}
          </div>
        )}

        {/* Gallery Selector Card matching reference screen #5 */}
        <label className="block w-full cursor-pointer">
          <input
            type="file"
            accept="video/*,image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="w-full p-6 rounded-3xl bg-[#160C25] border-2 border-dashed border-white/15 hover:border-[#F328D5] flex flex-col items-center justify-center text-center transition-colors group shadow-lg">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#3B82F6] to-[#8B20FF] text-white group-hover:scale-110 flex items-center justify-center mb-2 shadow-lg shadow-blue-500/25 transition-transform">
              <Play className="w-6 h-6 fill-white ml-0.5" />
            </div>
            <span className="text-sm font-black text-white">Select Video</span>
            <span className="text-xs text-[#B9AECF] mt-0.5">From Gallery</span>
          </div>
        </label>

        {/* Video Preview Card matching reference */}
        <div className="space-y-1.5">
          <label className="text-xs text-[#B9AECF] font-bold">Video Preview</label>
          <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-white/10 bg-black flex items-center justify-center shadow-md">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover filter brightness-90"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-xl">
                <Play className="w-5 h-5 fill-white ml-0.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs text-[#B9AECF] font-semibold">Title</label>
            <input
              type="text"
              placeholder="Enter video title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#160C25] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#B9AECF]/50 outline-none focus:border-[#F328D5]"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs text-[#B9AECF] font-semibold">Description</label>
            <textarea
              rows={2}
              placeholder="Tell us about your video..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#160C25] border border-white/15 rounded-xl p-3 text-xs text-white placeholder-[#B9AECF]/50 outline-none focus:border-[#F328D5] resize-none"
            />
          </div>

          {/* Hashtags */}
          <div className="space-y-1.5">
            <label className="text-xs text-[#B9AECF] font-semibold">Hashtags</label>
            <div className="flex flex-wrap items-center gap-1.5">
              {hashtags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-[#211333] border border-white/10 text-xs text-[#FFC84A] font-bold flex items-center gap-1"
                >
                  <span>{tag}</span>
                  <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-red-400">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              <div className="flex items-center gap-1">
                <input
                  type="text"
                  placeholder="#add"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddHashtag(); } }}
                  className="w-20 bg-black/40 border border-white/15 rounded-full px-2.5 py-1 text-xs text-white outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddHashtag}
                  className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xs"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="space-y-1">
            <label className="text-xs text-[#B9AECF] font-semibold">Privacy</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'public', label: 'Public', icon: Globe },
                { id: 'friends', label: 'Friends', icon: Users },
                { id: 'private', label: 'Private', icon: Lock }
              ].map((p) => {
                const Icon = p.icon;
                const isSelected = privacy === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPrivacy(p.id as any)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#8B20FF] to-[#F328D5] text-white border-transparent shadow'
                        : 'bg-[#160C25] border-white/10 text-[#B9AECF] hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Upload Progress Bar if active */}
          {isUploading && (
            <div className="space-y-1 pt-2">
              <div className="flex justify-between text-xs text-[#FFC84A] font-bold">
                <span>Uploading Video...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-[#8B20FF] via-[#F328D5] to-[#FFC84A] transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Upload Button matching screen #5 */}
          <button
            type="submit"
            disabled={isUploading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#8B20FF] via-[#a825e6] to-[#F328D5] text-white font-black text-sm shadow-xl shadow-[#8B20FF]/35 active:scale-95 transition-all disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4 stroke-[2.5]" />
            <span>{isUploading ? 'Publishing Video...' : 'Upload Video'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
