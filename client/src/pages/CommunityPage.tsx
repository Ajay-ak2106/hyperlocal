import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.js';
import { useRealtime } from '../contexts/RealtimeContext.js';
import { api } from '../services/api.js';
import { CommunityGroup, CommunityPost, SafetySummary } from '../types/index.js';
import {
  Users,
  Send,
  Camera,
  ShieldCheck,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  MapPin
} from 'lucide-react';
import { SafetyCheckinModal } from '../components/modals/SafetyCheckinModal.js';

export const CommunityPage: React.FC = () => {
  const { user, profile, currentArea, language, role } = useAuth();
  const { lastRealtimeEvent } = useRealtime();

  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('cg-1');
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [newPostMessage, setNewPostMessage] = useState('');
  const [postCategory, setPostCategory] = useState<'UPDATE' | 'FOOD_WATER' | 'ROAD_STATUS' | 'POWER_STATUS' | 'EMERGENCY'>('UPDATE');
  const [postPhotoUrl, setPostPhotoUrl] = useState<string | null>(null);
  const [safetySummary, setSafetySummary] = useState<SafetySummary>({ SAFE: 0, NEED_HELP: 0, EMERGENCY: 0, NO_RESPONSE: 0, TOTAL: 0 });
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);

  const fetchCommunityData = async () => {
    try {
      const [groupsData, postsData, safetyData] = await Promise.all([
        api.getCommunityGroups(),
        api.getCommunityPosts(),
        api.getSafetyStats()
      ]);
      setGroups(groupsData);
      setPosts(postsData);
      setSafetySummary(safetyData.summary);
    } catch (e) {
      console.warn('Error fetching community data:', e);
    }
  };

  useEffect(() => {
    fetchCommunityData();
  }, [lastRealtimeEvent]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostMessage.trim()) return;
    setPosting(true);

    try {
      await api.createCommunityPost({
        community_id: selectedGroup,
        author_id: user?.id,
        author_name: profile?.name || 'Community Resident',
        message: newPostMessage,
        category: postCategory,
        photo_url: postPhotoUrl,
        is_demo: 1
      });
      setNewPostMessage('');
      setPostPhotoUrl(null);
      await fetchCommunityData();
    } catch (err) {
      console.error(err);
    } finally {
      setPosting(false);
    }
  };

  const handleTriggerPoll = async () => {
    try {
      await api.triggerSafetyPoll({
        community_id: selectedGroup,
        area: currentArea
      });
      alert('Safety Check poll broadcasted to all residents in ' + currentArea);
    } catch (e) {
      console.error(e);
    }
  };

  const currentGroupObj = groups.find((g) => g.id === selectedGroup) || groups[0];

  return (
    <div className="pb-24 pt-3 px-3 sm:px-6 max-w-5xl mx-auto space-y-4">
      {/* Community Header & Ward Switcher */}
      <div className="bg-cyber-panel border border-cyber-green/40 p-5 rounded-2xl shadow-neon-green flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative">
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyber-green"></div>
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyber-green"></div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-cyber-green/15 text-cyber-green border border-cyber-green/40 glow-text-green">
              [CIVIC NET // LOCAL WARD COMMS]
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-mono font-black text-white">
            {currentGroupObj?.name || 'Velachery Lake Ward Community'}
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1 max-w-xl">
            {currentGroupObj?.description || 'Hyperlocal disaster watch and peer-to-peer survival communications network.'}
          </p>
        </div>

        {/* Safety Poll Action */}
        <div className="flex items-center gap-2 font-mono">
          <button
            onClick={() => setShowSafetyModal(true)}
            className="py-3 px-4 rounded bg-cyber-green text-black font-extrabold text-xs shadow-neon-green hover:brightness-110 active:scale-95 transition-all touch-target"
          >
            🟢 I AM SAFE
          </button>

          {(role === 'COMMUNITY_COORDINATOR' || role === 'ADMIN') && (
            <button
              onClick={handleTriggerPoll}
              className="py-3 px-4 rounded bg-cyber-panel hover:bg-cyber-amber/20 border border-cyber-amber/50 font-extrabold text-xs text-cyber-amber flex items-center gap-1.5 active:scale-95 touch-target transition-colors"
            >
              <Radio className="w-4 h-4 text-cyber-amber animate-pulse" />
              <span>BROADCAST POLL</span>
            </button>
          )}
        </div>
      </div>

      {/* Realtime Community Safety Numbers */}
      <div className="p-4 rounded-xl bg-cyber-panel border border-cyber-border shadow-md">
        <div className="flex items-center justify-between mb-3 font-mono">
          <h3 className="text-xs font-bold text-cyber-green uppercase tracking-wider flex items-center gap-1.5 glow-text-green">
            <ShieldCheck className="w-4 h-4 text-cyber-green" />
            LIVE SECTOR SAFETY STATUS HUD
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">
            {safetySummary.TOTAL} TOTAL VERIFIED CITIZENS
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono">
          <div className="p-3 rounded-lg bg-cyber-bg border border-cyber-green/40 text-center shadow-[0_0_10px_rgba(0,255,157,0.1)]">
            <div className="text-xl font-black text-cyber-green glow-text-green">{safetySummary.SAFE}</div>
            <div className="text-[10px] font-bold text-cyber-green/80 mt-0.5">🟢 SAFE</div>
          </div>
          <div className="p-3 rounded-lg bg-cyber-bg border border-cyber-amber/40 text-center shadow-[0_0_10px_rgba(255,183,3,0.1)]">
            <div className="text-xl font-black text-cyber-amber">{safetySummary.NEED_HELP}</div>
            <div className="text-[10px] font-bold text-cyber-amber/80 mt-0.5">🟡 NEED ASSISTANCE</div>
          </div>
          <div className="p-3 rounded-lg bg-cyber-bg border border-cyber-red/40 text-center shadow-[0_0_10px_rgba(255,42,85,0.15)]">
            <div className="text-xl font-black text-cyber-red glow-text-red">{safetySummary.EMERGENCY}</div>
            <div className="text-[10px] font-bold text-cyber-red/80 mt-0.5">🔴 CRITICAL SOS</div>
          </div>
          <div className="p-3 rounded-lg bg-cyber-bg border border-slate-700 text-center">
            <div className="text-xl font-black text-slate-400">{safetySummary.NO_RESPONSE}</div>
            <div className="text-[10px] font-bold text-slate-400 mt-0.5">⚪ UNACCOUNTED</div>
          </div>
        </div>
      </div>

      {/* Post a New Update Form */}
      <form onSubmit={handleCreatePost} className="p-4 rounded-xl bg-cyber-panel border border-cyber-border space-y-3 font-mono">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            &gt; TRANSMIT WARD REPORT:
          </span>
          {/* Category tags */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {(['UPDATE', 'FOOD_WATER', 'ROAD_STATUS', 'POWER_STATUS', 'EMERGENCY'] as const).map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => setPostCategory(cat)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors whitespace-nowrap border ${
                  postCategory === cat
                    ? 'bg-cyber-green text-black border-cyber-green font-extrabold'
                    : 'bg-cyber-bg text-slate-400 border-cyber-border hover:text-white'
                }`}
              >
                {cat.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newPostMessage}
            onChange={(e) => setNewPostMessage(e.target.value)}
            placeholder="e.g. Water tankers arriving at community hall, Road clear near bridge..."
            className="flex-1 rounded bg-cyber-bg border border-cyber-border px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyber-green outline-none font-sans"
          />

          <button
            type="submit"
            disabled={posting || !newPostMessage.trim()}
            className="py-2.5 px-5 rounded bg-cyber-green text-black disabled:opacity-40 font-extrabold text-xs flex items-center gap-1.5 shadow-neon-green active:scale-95 transition-all touch-target"
          >
            <Send className="w-4 h-4" />
            <span>TRANSMIT</span>
          </button>
        </div>
      </form>

      {/* Community Feed Posts */}
      <div className="space-y-3">
        {posts.length === 0 ? (
          <div className="py-12 text-center text-xs font-mono text-slate-500">
            NO WARD DISPATCHES RECORDED YET. BE THE FIRST TO BROADCAST AN UPDATE!
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="p-4 rounded-xl bg-cyber-panel border border-cyber-border hover:border-cyber-green/40 shadow-sm space-y-2 transition-all"
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{post.author_name}</span>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-cyber-bg border border-cyber-border text-cyber-cyan">
                    {post.category.replace(/_/g, ' ')}
                  </span>
                  {post.verified && (
                    <span className="text-[10px] text-cyber-green font-bold flex items-center gap-0.5 glow-text-green">
                      <CheckCircle2 className="w-3 h-3" />
                      VERIFIED
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                {post.message}
              </p>
            </div>
          ))
        )}
      </div>

      <SafetyCheckinModal
        isOpen={showSafetyModal}
        onClose={() => setShowSafetyModal(false)}
        onSuccess={fetchCommunityData}
      />
    </div>
  );
};
