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
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-extrabold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              👥 Local Ward Community
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            {currentGroupObj?.name || 'Velachery Lake Ward Community'}
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            {currentGroupObj?.description || 'Hyperlocal watch and rapid disaster coordination network.'}
          </p>
        </div>

        {/* Safety Poll Action */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSafetyModal(true)}
            className="py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 font-extrabold text-xs text-white shadow-lg shadow-emerald-950 active:scale-95 transition-all touch-target"
          >
            🟢 I AM SAFE
          </button>

          {(role === 'COMMUNITY_COORDINATOR' || role === 'ADMIN') && (
            <button
              onClick={handleTriggerPoll}
              className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 font-extrabold text-xs text-amber-300 flex items-center gap-1.5 active:scale-95 touch-target"
            >
              <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>ASK "ARE YOU SAFE?"</span>
            </button>
          )}
        </div>
      </div>

      {/* Realtime Community Safety Numbers (Directly from SQL queries) */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Live Ward Safety Check-in Dashboard
          </h3>
          <span className="text-[10px] text-slate-500 font-mono">
            {safetySummary.TOTAL} Total Check-ins
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-center">
            <div className="text-xl font-black text-emerald-400">{safetySummary.SAFE}</div>
            <div className="text-[11px] font-bold text-emerald-200/80">🟢 SAFE</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-center">
            <div className="text-xl font-black text-amber-400">{safetySummary.NEED_HELP}</div>
            <div className="text-[11px] font-bold text-amber-200/80">🟡 NEED HELP</div>
          </div>
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-center">
            <div className="text-xl font-black text-rose-400">{safetySummary.EMERGENCY}</div>
            <div className="text-[11px] font-bold text-rose-200/80">🔴 EMERGENCY</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 text-center">
            <div className="text-xl font-black text-slate-400">{safetySummary.NO_RESPONSE}</div>
            <div className="text-[11px] font-bold text-slate-400">⚪ NO RESPONSE</div>
          </div>
        </div>
      </div>

      {/* Post a New Update Form */}
      <form onSubmit={handleCreatePost} className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Share Ward Update
          </span>
          {/* Category tags */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {(['UPDATE', 'FOOD_WATER', 'ROAD_STATUS', 'POWER_STATUS', 'EMERGENCY'] as const).map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => setPostCategory(cat)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase transition-colors whitespace-nowrap ${
                  postCategory === cat
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
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
            className="flex-1 rounded-2xl bg-slate-950 border border-slate-700 px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-rose-500"
          />

          <button
            type="submit"
            disabled={posting || !newPostMessage.trim()}
            className="py-3 px-5 rounded-2xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-rose-950 active:scale-95 touch-target"
          >
            <Send className="w-4 h-4" />
            <span>POST</span>
          </button>
        </div>
      </form>

      {/* Community Feed Posts */}
      <div className="space-y-3">
        {posts.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No community posts yet. Be the first to share an update for your neighbours!
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-white">{post.author_name}</span>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                    {post.category.replace(/_/g, ' ')}
                  </span>
                  {post.verified && (
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
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
