import React, { useState, useEffect } from 'react';
import { 
  ScreenType, 
  UserProfile, 
  LiveStream, 
  PartyRoom, 
  GiftItem, 
  Conversation,
  PlatformViewMode,
  PKMatchSession,
  PKMatchInvitation 
} from './types';
import { 
  CURRENT_USER, 
  MOCK_USERS, 
  MOCK_LIVE_STREAMS, 
  MOCK_PARTY_ROOMS, 
  MOCK_GIFTS, 
  MOCK_CONVERSATIONS, 
  MOCK_STAR_RANKINGS 
} from './data/mockData';
import { getInitialUserProfile, saveStoredUserProfile } from './utils/storage';
import { pkService } from './utils/pkService';

// Common Components
import { TopBar } from './components/common/TopBar';
import { BottomNav } from './components/common/BottomNav';
import { DesktopSidebar } from './components/common/DesktopSidebar';
import { CreateActionSheet } from './components/common/CreateActionSheet';
import { UserProfileModal } from './components/common/UserProfileModal';

// Screens
import { SplashScreen } from './components/screens/SplashScreen';
import { AuthScreen } from './components/screens/AuthScreen';
import { HomeScreen } from './components/screens/HomeScreen';
import { RoomsScreen } from './components/screens/RoomsScreen';
import { ActiveLiveScreen } from './components/screens/ActiveLiveScreen';
import { AudioRoomScreen } from './components/screens/AudioRoomScreen';
import { CreateLiveScreen } from './components/screens/CreateLiveScreen';
import { CreateRoomScreen } from './components/screens/CreateRoomScreen';
import { RankingsScreen } from './components/screens/RankingsScreen';
import { MessagesScreen } from './components/screens/MessagesScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { VideoFeedScreen } from './components/screens/VideoFeedScreen';
import { UploadVideoScreen } from './components/screens/UploadVideoScreen';
import { INITIAL_VIDEOS } from './data/videoData';
import { VideoItem } from './types';

// Modals
import { GiftShopModal } from './components/screens/GiftShopModal';
import { PKBattleModal } from './components/screens/PKBattleModal';
import { PKHostInviteModal } from './components/screens/PKHostInviteModal';
import { PKIncomingChallengeModal } from './components/screens/PKIncomingChallengeModal';
import { PKWinnerAnnouncementModal } from './components/screens/PKWinnerAnnouncementModal';
import { WalletModal } from './components/screens/WalletModal';
import { VIPModal } from './components/screens/VIPModal';
import { SearchModal } from './components/screens/SearchModal';
import { NotificationsModal } from './components/screens/NotificationsModal';

export default function App() {
  // Navigation & Screen State
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('splash');
  const [viewMode, setViewMode] = useState<PlatformViewMode>('responsive');

  // Application Data States (persisted via localStorage)
  const [currentUser, setCurrentUser] = useState<UserProfile>(getInitialUserProfile);
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>(MOCK_LIVE_STREAMS);
  const [partyRooms, setPartyRooms] = useState<PartyRoom[]>(MOCK_PARTY_ROOMS);
  const [videos, setVideos] = useState<VideoItem[]>(INITIAL_VIDEOS);

  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [gifts] = useState<GiftItem[]>(MOCK_GIFTS);

  // Active Broadcast State
  const [activeLiveStream, setActiveLiveStream] = useState<LiveStream | null>(null);
  const [activeAudioRoom, setActiveAudioRoom] = useState<PartyRoom | null>(null);

  // Modals & Sheets Visibility
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [isGiftShopOpen, setIsGiftShopOpen] = useState(false);
  const [giftRecipient, setGiftRecipient] = useState<UserProfile | null>(null);
  const [isPKModalOpen, setIsPKModalOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isVIPOpen, setIsVIPOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [viewingProfileUser, setViewingProfileUser] = useState<UserProfile | null>(null);
  const [activeChatUser, setActiveChatUser] = useState<UserProfile | null>(null);

  // PK Battle Real-Time States
  const [isPKInviteModalOpen, setIsPKInviteModalOpen] = useState(false);
  const [activePKSession, setActivePKSession] = useState<PKMatchSession | null>(null);
  const [incomingPKInvite, setIncomingPKInvite] = useState<PKMatchInvitation | null>(null);
  const [pkWinnerSession, setPkWinnerSession] = useState<PKMatchSession | null>(null);

  // Active Live Gift Animation Overlay
  const [activeGiftCelebration, setActiveGiftCelebration] = useState<{
    gift: GiftItem;
    sender: string;
    recipient: string;
    quantity: number;
  } | null>(null);

  // Real-time PK Event Subscriptions & Sync
  useEffect(() => {
    pkService.setCurrentUser(currentUser.id);

    const unsubscribe = pkService.addEventListener((event, payload) => {
      if (event === 'pk:invite_received' && payload) {
        setIncomingPKInvite(payload);
      } else if (event === 'pk:match_started' && payload?.session) {
        setActivePKSession(payload.session);
        setIsPKInviteModalOpen(false);
        setIsPKModalOpen(false);
        setIncomingPKInvite(null);
        setCurrentScreen('live_active');
      } else if (event === 'pk:match_ended' && payload?.session) {
        setPkWinnerSession(payload.session);
        setActivePKSession(null);
        if (payload.session.winnerId) {
          const isWinner = payload.session.winnerId === currentUser.id;
          const isDraw = payload.session.winnerId === 'draw';
          const opponent = payload.session.host1.user.id === currentUser.id ? payload.session.host2.user : payload.session.host1.user;
          const myHost = payload.session.host1.user.id === currentUser.id ? payload.session.host1 : payload.session.host2;
          const opponentHost = payload.session.host1.user.id === currentUser.id ? payload.session.host2 : payload.session.host1;

          pkService.saveMatchHistoryLocally(currentUser.id, {
            id: `hist_${Date.now()}`,
            matchId: payload.session.id,
            date: 'Just now',
            durationSeconds: 300,
            opponent: {
              id: opponent.id,
              name: opponent.name,
              username: opponent.username || '@' + opponent.name.toLowerCase().replace(/\s+/g, ''),
              avatar: opponent.avatar,
              level: opponent.level || 1
            },
            myScore: myHost.score,
            opponentScore: opponentHost.score,
            result: isWinner ? 'win' : isDraw ? 'draw' : 'loss',
            giftsReceived: myHost.giftsReceivedCount,
            likesReceived: myHost.likes,
            coinsEarned: myHost.giftsCoinValue
          });
        }
      } else if (event === 'pk:match_cancelled' && payload?.session) {
        setPkWinnerSession(payload.session);
        setActivePKSession(null);
      } else if (event === 'pk:sync_state' && payload?.session) {
        setActivePKSession(payload.session);
      }
    });

    return () => unsubscribe();
  }, [currentUser.id]);

  const handleAcceptPKInvite = async (invite: PKMatchInvitation) => {
    try {
      const res = await pkService.respondPKInvite(invite.id, true, currentUser.id);
      if (res.session) {
        setActivePKSession(res.session);
        setIncomingPKInvite(null);
        setCurrentScreen('live_active');
      }
    } catch (e) {
      console.error('Error accepting PK invite:', e);
    }
  };

  const handleDeclinePKInvite = async (invite: PKMatchInvitation) => {
    try {
      await pkService.respondPKInvite(invite.id, false, currentUser.id);
      setIncomingPKInvite(null);
    } catch (e) {
      setIncomingPKInvite(null);
    }
  };

  const handleForfeitPK = async () => {
    if (!activePKSession) return;
    try {
      await pkService.forfeitMatch(activePKSession.id, currentUser.id);
    } catch (e) {
      console.error('Error forfeiting PK match:', e);
    }
  };

  const handleOpenPKFromNav = () => {
    if (activeLiveStream) {
      setIsPKInviteModalOpen(true);
      setCurrentScreen('live_active');
    } else {
      const stream = liveStreams[0] || MOCK_LIVE_STREAMS[0];
      setActiveLiveStream(stream);
      setIsPKInviteModalOpen(true);
      setCurrentScreen('live_active');
    }
  };

  // Handler: Splash Completion
  const handleSplashComplete = () => {
    setCurrentScreen('home');
  };

  // Handler: Auth Success
  const handleAuthSuccess = () => {
    setCurrentScreen('home');
  };

  // Handler: Logout
  const handleLogout = () => {
    setCurrentScreen('auth');
    setActiveLiveStream(null);
    setActiveAudioRoom(null);
  };

  // Handler: Select & Open a Live Stream
  const handleSelectLive = (stream: LiveStream) => {
    setActiveLiveStream(stream);
    setCurrentScreen('live_active');
  };

  // Handler: Select & Open an Audio Party Room
  const handleSelectRoom = (room: PartyRoom) => {
    setActiveAudioRoom(room);
    setCurrentScreen('audio_room');
  };

  // Handler: Start Newly Created Live
  const handleStartLive = (newStream: LiveStream) => {
    setLiveStreams([newStream, ...liveStreams]);
    setActiveLiveStream(newStream);
    setCurrentScreen('live_active');
  };

  // Handler: Create Newly Created Audio Room
  const handleCreateRoom = (newRoom: PartyRoom) => {
    setPartyRooms([newRoom, ...partyRooms]);
    setActiveAudioRoom(newRoom);
    setCurrentScreen('audio_room');
  };

  // Handler: Update User Profile (Immediate UI update + localStorage persistence)
  const handleUpdateProfile = (updated: UserProfile) => {
    setCurrentUser(updated);
    saveStoredUserProfile(updated);
  };

  // Handler: Send Gift
  const handleSendGift = (gift: GiftItem, quantity: number, recipient: UserProfile) => {
    const cost = gift.coins * quantity;
    if (currentUser.coins >= cost) {
      setCurrentUser((prev) => {
        const next = {
          ...prev,
          coins: prev.coins - cost,
        };
        saveStoredUserProfile(next);
        return next;
      });

      // If in active PK Battle, broadcast authoritative score update to match
      if (activePKSession) {
        pkService.sendPKGift(
          activePKSession.id,
          currentUser,
          recipient.id,
          gift,
          quantity
        ).then((res) => {
          if (res?.host1Score !== undefined && res?.host2Score !== undefined) {
            setActivePKSession((prev) => {
              if (!prev) return null;
              return {
                ...prev,
                host1: {
                  ...prev.host1,
                  score: res.host1Score
                },
                host2: {
                  ...prev.host2,
                  score: res.host2Score
                }
              };
            });
          }
        }).catch((err) => {
          console.warn('PK gift error:', err);
        });
      }

      // Trigger Celebration Banner
      setActiveGiftCelebration({
        gift,
        sender: currentUser.name,
        recipient: recipient.name,
        quantity,
      });

      setTimeout(() => {
        setActiveGiftCelebration(null);
      }, 4000);
    }
  };

  // Handler: Recharge Coins
  const handleRechargeSuccess = (addedCoins: number) => {
    setCurrentUser((prev) => {
      const next = {
        ...prev,
        coins: prev.coins + addedCoins,
      };
      saveStoredUserProfile(next);
      return next;
    });
  };

  // Handler: Upgrade VIP Level
  const handleUpgradeVIP = (newLevel: number) => {
    setCurrentUser((prev) => {
      const next = {
        ...prev,
        vipLevel: newLevel,
        isVIP: true,
      };
      saveStoredUserProfile(next);
      return next;
    });
  };


  // Handler: Toggle Follow User
  const handleToggleFollow = (userId: string) => {
    setLiveStreams((prev) =>
      prev.map((s) => (s.host.id === userId ? { ...s, host: { ...s.host, isFollowing: !s.host.isFollowing } } : s))
    );
    if (viewingProfileUser && viewingProfileUser.id === userId) {
      setViewingProfileUser((prev) => (prev ? { ...prev, isFollowing: !prev.isFollowing } : null));
    }
  };

  // Handler: Jump to Direct Message with a User
  const handleSendMessageToUser = (user: UserProfile) => {
    setViewingProfileUser(null);
    setActiveChatUser(user);
    setCurrentScreen('messages');
  };

  // Top hosts derived from users
  const topHostsList = Object.values(MOCK_USERS);

  // Full Screen Overlays (Splash & Auth)
  if (currentScreen === 'splash') {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  if (currentScreen === 'auth') {
    return <AuthScreen onSuccess={handleAuthSuccess} />;
  }

  // Full Screen Live Broadcast View
  if (currentScreen === 'live_active' && activeLiveStream) {
    return (
      <div className="relative w-full h-screen bg-black">
        <ActiveLiveScreen
          stream={activeLiveStream}
          currentUser={currentUser}
          onClose={() => {
            setActiveLiveStream(null);
            setActivePKSession(null);
            setCurrentScreen('home');
          }}
          onOpenGiftShop={(recipient) => {
            setGiftRecipient(recipient);
            setIsGiftShopOpen(true);
          }}
          onOpenPK={() => setIsPKInviteModalOpen(true)}
          onSelectUser={(u) => setViewingProfileUser(u)}
          activeGiftCelebration={activeGiftCelebration}
          activePKSession={activePKSession}
          onForfeitPK={handleForfeitPK}
          onRematchPK={() => setIsPKInviteModalOpen(true)}
        />
        {/* Supporting Modals when inside live stream */}
        <GiftShopModal
          isOpen={isGiftShopOpen}
          onClose={() => setIsGiftShopOpen(false)}
          currentUser={currentUser}
          recipientUser={giftRecipient || (activePKSession ? (giftRecipient || activePKSession.host2.user) : activeLiveStream.host)}
          gifts={gifts}
          onSendGift={handleSendGift}
          onOpenWallet={() => setIsWalletOpen(true)}
        />
        <PKHostInviteModal
          isOpen={isPKInviteModalOpen}
          onClose={() => setIsPKInviteModalOpen(false)}
          currentUser={currentUser}
          activeHost={activeLiveStream.host}
          onMatchStarted={(session) => {
            setActivePKSession(session);
            setIsPKInviteModalOpen(false);
          }}
        />
        <PKIncomingChallengeModal
          invitation={incomingPKInvite}
          onAccept={handleAcceptPKInvite}
          onDecline={handleDeclinePKInvite}
        />
        <PKWinnerAnnouncementModal
          session={pkWinnerSession}
          currentUser={currentUser}
          isOpen={!!pkWinnerSession}
          onClose={() => setPkWinnerSession(null)}
          onRematch={() => {
            setPkWinnerSession(null);
            setIsPKInviteModalOpen(true);
          }}
          onViewHistory={() => {
            setPkWinnerSession(null);
            setCurrentScreen('profile');
          }}
        />
        <UserProfileModal
          user={viewingProfileUser}
          isOpen={!!viewingProfileUser}
          onClose={() => setViewingProfileUser(null)}
          onToggleFollow={handleToggleFollow}
          onSendMessage={handleSendMessageToUser}
          onSendGift={(u) => {
            setGiftRecipient(u);
            setIsGiftShopOpen(true);
          }}
        />
        <WalletModal
          isOpen={isWalletOpen}
          onClose={() => setIsWalletOpen(false)}
          currentUser={currentUser}
          onRechargeSuccess={handleRechargeSuccess}
        />
      </div>
    );
  }

  // Full Screen Audio Room View
  if (currentScreen === 'audio_room' && activeAudioRoom) {
    return (
      <div className="relative w-full min-h-screen bg-[#090611]">
        <AudioRoomScreen
          room={activeAudioRoom}
          currentUser={currentUser}
          onClose={() => {
            setActiveAudioRoom(null);
            setCurrentScreen('party');
          }}
          onOpenGiftShop={(recipient) => {
            setGiftRecipient(recipient);
            setIsGiftShopOpen(true);
          }}
          onSelectUser={(u) => setViewingProfileUser(u)}
          onOpenPK={handleOpenPKFromNav}
          activeGiftCelebration={activeGiftCelebration}
        />
        {/* Supporting Modals when inside audio room */}
        <GiftShopModal
          isOpen={isGiftShopOpen}
          onClose={() => setIsGiftShopOpen(false)}
          currentUser={currentUser}
          recipientUser={giftRecipient || activeAudioRoom.host}
          gifts={gifts}
          onSendGift={handleSendGift}
          onOpenWallet={() => setIsWalletOpen(true)}
        />
        <UserProfileModal
          user={viewingProfileUser}
          isOpen={!!viewingProfileUser}
          onClose={() => setViewingProfileUser(null)}
          onToggleFollow={handleToggleFollow}
          onSendMessage={handleSendMessageToUser}
          onSendGift={(u) => {
            setGiftRecipient(u);
            setIsGiftShopOpen(true);
          }}
        />
        <WalletModal
          isOpen={isWalletOpen}
          onClose={() => setIsWalletOpen(false)}
          currentUser={currentUser}
          onRechargeSuccess={handleRechargeSuccess}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#090611] text-white flex flex-col md:flex-row antialiased selection:bg-[#F328D5]/30">
      
      {/* Desktop Persistent Left Sidebar (Visible on md: and up) */}
      <DesktopSidebar
        currentScreen={currentScreen}
        currentUser={currentUser}
        onNavigate={(screen) => setCurrentScreen(screen)}
        onOpenCreateLive={() => setCurrentScreen('create_live')}
        onOpenCreateRoom={() => setCurrentScreen('create_room')}
        onOpenWallet={() => setIsWalletOpen(true)}
        onOpenGiftShop={() => {
          setGiftRecipient(null);
          setIsGiftShopOpen(true);
        }}
        onOpenPKModal={handleOpenPKFromNav}
        onOpenVIP={() => setIsVIPOpen(true)}
        onLogout={handleLogout}
        unreadMessagesCount={99}
      />

      {/* Main Responsive Application Area */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0 bg-[#090611] overflow-x-hidden relative">
        
        {/* Top Bar (Header with avatar, username, ID, search, notifications, coin balance) */}
        <TopBar
          currentUser={currentUser}
          currentScreen={currentScreen}
          onNavigate={(screen) => setCurrentScreen(screen)}
          onOpenWallet={() => setIsWalletOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenVIP={() => setIsVIPOpen(true)}
          unreadCount={2}
        />

        {/* Primary Screen Render Router */}
        <main className="flex-1 w-full">
          {currentScreen === 'home' && (
            <HomeScreen
              liveStreams={liveStreams}
              partyRooms={partyRooms}
              topHosts={topHostsList}
              onSelectLive={handleSelectLive}
              onSelectRoom={handleSelectRoom}
              onSelectUser={(u) => setViewingProfileUser(u)}
              onNavigate={(s) => setCurrentScreen(s)}
              onOpenPK={handleOpenPKFromNav}
              onOpenGiftShop={() => {
                setGiftRecipient(null);
                setIsGiftShopOpen(true);
              }}
            />
          )}

          {currentScreen === 'party' && (
            <RoomsScreen
              partyRooms={partyRooms}
              onSelectRoom={handleSelectRoom}
              onNavigate={(s) => setCurrentScreen(s)}
              onOpenCreateRoom={() => setCurrentScreen('create_room')}
              onOpenSearch={() => setIsSearchOpen(true)}
            />
          )}

          {currentScreen === 'create_live' && (
            <CreateLiveScreen
              currentUser={currentUser}
              onClose={() => setCurrentScreen('home')}
              onStartLive={handleStartLive}
            />
          )}

          {currentScreen === 'create_room' && (
            <CreateRoomScreen
              currentUser={currentUser}
              onClose={() => setCurrentScreen('party')}
              onCreateRoom={handleCreateRoom}
            />
          )}

          {currentScreen === 'rankings' && (
            <RankingsScreen
              currentUser={currentUser}
              onNavigate={(s) => setCurrentScreen(s)}
              onSelectUser={(u) => setViewingProfileUser(u)}
            />
          )}

          {currentScreen === 'messages' && (
            <MessagesScreen
              currentUser={currentUser}
              conversations={conversations}
              onNavigate={(s) => setCurrentScreen(s)}
              onSelectUser={(u) => setViewingProfileUser(u)}
              onOpenGiftShop={(u) => {
                setGiftRecipient(u);
                setIsGiftShopOpen(true);
              }}
              activeChatUser={activeChatUser}
              onCloseChat={() => setActiveChatUser(null)}
            />
          )}

          {currentScreen === 'videos' && (
            <VideoFeedScreen
              videos={videos}
              currentUser={currentUser}
              onOpenGiftShop={(recipient) => {
                setGiftRecipient(recipient);
                setIsGiftShopOpen(true);
              }}
              onSelectUser={(u) => setViewingProfileUser(u)}
              onUploadClick={() => setCurrentScreen('upload_video')}
            />
          )}

          {currentScreen === 'upload_video' && (
            <UploadVideoScreen
              currentUser={currentUser}
              onClose={() => setCurrentScreen('videos')}
              onUploadSuccess={(newVideo) => {
                setVideos([newVideo, ...videos]);
                setCurrentScreen('videos');
              }}
            />
          )}

          {currentScreen === 'profile' && (
            <ProfileScreen
              currentUser={currentUser}
              onUpdateProfile={handleUpdateProfile}
              onNavigate={(s) => setCurrentScreen(s)}
              onOpenWallet={() => setIsWalletOpen(true)}
              onOpenVIP={() => setIsVIPOpen(true)}
              userVideos={videos.filter(v => v.creator.id === currentUser.id || v.creator.name === currentUser.name)}
              onSelectVideo={(v) => setCurrentScreen('videos')}
              onOpenUploadVideo={() => setCurrentScreen('upload_video')}
              onDeleteVideo={(id) => setVideos((prev) => prev.filter((v) => v.id !== id))}
            />
          )}

          {currentScreen === 'settings' && (
            <SettingsScreen
              onNavigate={(s) => setCurrentScreen(s)}
              onLogout={handleLogout}
            />
          )}
        </main>

        {/* Mobile Fixed Bottom Navigation Bar */}
        <BottomNav
          currentScreen={currentScreen}
          onNavigate={(screen) => setCurrentScreen(screen)}
          onOpenCreate={() => setIsCreateSheetOpen(true)}
          unreadMessagesCount={99}
        />
      </div>

      {/* Global Modals & Interactive Sheets */}
      
      {/* 1. Center Button Action Sheet: Create Live vs Create Room vs Upload Video */}
      <CreateActionSheet
        isOpen={isCreateSheetOpen}
        onClose={() => setIsCreateSheetOpen(false)}
        onSelectCreateLive={() => setCurrentScreen('create_live')}
        onSelectCreateRoom={() => setCurrentScreen('create_room')}
        onSelectUploadVideo={() => setCurrentScreen('upload_video')}
      />

      {/* 2. Gift Shop & Sending Panel */}
      <GiftShopModal
        isOpen={isGiftShopOpen}
        onClose={() => setIsGiftShopOpen(false)}
        currentUser={currentUser}
        recipientUser={giftRecipient}
        gifts={gifts}
        onSendGift={handleSendGift}
        onOpenWallet={() => setIsWalletOpen(true)}
      />

      {/* 3. PK Battle Arena Modal */}
      <PKBattleModal
        isOpen={isPKModalOpen}
        onClose={() => setIsPKModalOpen(false)}
        currentUser={currentUser}
        onOpenGiftShop={(r) => {
          setGiftRecipient(r);
          setIsGiftShopOpen(true);
        }}
      />

      {/* 4. Wallet & Coins Recharge Modal */}
      <WalletModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        currentUser={currentUser}
        onRechargeSuccess={handleRechargeSuccess}
      />

      {/* 5. VIP Membership Privileges Modal */}
      <VIPModal
        isOpen={isVIPOpen}
        onClose={() => setIsVIPOpen(false)}
        currentUser={currentUser}
        onUpgradeVIP={handleUpgradeVIP}
      />

      {/* 6. Search & Discovery Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        liveStreams={liveStreams}
        partyRooms={partyRooms}
        users={topHostsList}
        onSelectLive={handleSelectLive}
        onSelectRoom={handleSelectRoom}
        onSelectUser={(u) => setViewingProfileUser(u)}
      />

      {/* 7. Notifications Center Modal */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onMarkAllRead={() => {}}
      />

      {/* 8. User / Host Profile Detail Modal */}
      <UserProfileModal
        user={viewingProfileUser}
        isOpen={!!viewingProfileUser}
        onClose={() => setViewingProfileUser(null)}
        onToggleFollow={handleToggleFollow}
        onSendMessage={handleSendMessageToUser}
        onSendGift={(u) => {
          setGiftRecipient(u);
          setIsGiftShopOpen(true);
        }}
      />

      {/* 9. Global Real-Time PK Challenge Invitation Popup */}
      <PKIncomingChallengeModal
        invitation={incomingPKInvite}
        onAccept={handleAcceptPKInvite}
        onDecline={handleDeclinePKInvite}
      />

      {/* 10. Global PK Battle Winner Announcement Modal */}
      <PKWinnerAnnouncementModal
        session={pkWinnerSession}
        currentUser={currentUser}
        isOpen={!!pkWinnerSession}
        onClose={() => setPkWinnerSession(null)}
        onRematch={() => {
          setPkWinnerSession(null);
          handleOpenPKFromNav();
        }}
        onViewHistory={() => {
          setPkWinnerSession(null);
          setCurrentScreen('profile');
        }}
      />
    </div>
  );
}
