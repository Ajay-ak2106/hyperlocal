import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.js';
import { useRealtime } from '../contexts/RealtimeContext.js';
import { api } from '../services/api.js';
import { CommunityGroup, CommunityPost, SafetySummary } from '../types/index.js';
import {
  Users,
  Send,
  ShieldCheck,
  Radio,
  CheckCircle2,
  Clock
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
  const [safetySummary, setSafetySummary] = useState<SafetySummary>({ SAFE: 0, NEED_HELP: 0, EMERGENCY: 0, NO_RESPONSE: 0, TOTAL: 0 });
  const [showSafetyModal, setShowSafetyModal] = useState(false);
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
        author_name: profile?.name || 'Local Resident',
        message: newPostMessage,
        category: postCategory,
        is_demo: 1
      });
      setNewPostMessage('');
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
      alert('Safety poll sent to residents in ' + currentArea);
    } catch (e) {
      console.error(e);
    }
  };

  const currentGroupObj = groups.find((g) => g.id === selectedGroup) || groups[0];

  return (
    <div className="pb-24 pt-3 px-3 sm:px-6 max-w-5xl mx-auto space-y-4">
      {/* Community Header */}
      <div className="bg-slate-900 border border-slate-700 p-5 rounded-2xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <span>👥</span>
            {currentGroupObj?.name || `${currentArea} Community Board`}
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            {language === 'ta'
              ? 'உள்ளூர் வாசிகள் மற்றும் தன்னார்வலர்களின் நேரடி தகவல் பரிமாற்றம்.'
              : 'Live updates, water tanker locations, and safe passage reports from neighbors.'}
          </p>
        </div>

        {/* Safety Check-in Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSafetyModal(true)}
            className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm active:scale-95 transition-all"
          >
            🟢 {language === 'ta' ? 'பாதுகாப்பு பதிவு' : 'I Am Safe'}
          </button>

          {(role === 'COMMUNITY_COORDINATOR' || role === 'ADMIN') && (
            <button
              onClick={handleTriggerPoll}
              className="py-2.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-amber-500/40 text-amber-300 font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Poll Status</span>
            </button>
          )}
        </div>
      </div>

      {/* Safety numbers card */}
      <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 shadow-sm">
        <div className="flex items-center justify-between mb-3 text-xs">
          <h3 className="font-bold text-emerald-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Community Safety Overview</span>
          </h3>
          <span className="text-slate-400">
            {safetySummary.TOTAL} Total Verified Citizens
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-700">
            <div className="text-xl font-bold text-emerald-400">{safetySummary.SAFE}</div>
            <div className="text-xs text-slate-300 mt-0.5">🟢 Safe</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-700">
            <div className="text-xl font-bold text-amber-400">{safetySummary.NEED_HELP}</div>
            <div className="text-xs text-slate-300 mt-0.5">🟡 Need Help</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-700">
            <div className="text-xl font-bold text-red-400">{safetySummary.EMERGENCY}</div>
            <div className="text-xs text-slate-300 mt-0.5">🔴 Critical SOS</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-700">
            <div className="text-xl font-bold text-slate-400">{safetySummary.NO_RESPONSE}</div>
            <div className="text-xs text-slate-400 mt-0.5">⚪ Unchecked</div>
          </div>
        </div>
      </div>

      {/* Post a New Update Form */}
      <form onSubmit={handleCreatePost} className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="font-semibold text-slate-300">
            Share an update:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {(['UPDATE', 'FOOD_WATER', 'ROAD_STATUS', 'POWER_STATUS', 'EMERGENCY'] as const).map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => setPostCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors whitespace-nowrap border ${
                  postCategory === cat
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
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
            placeholder="e.g. Water tanker arrived near park, road cleared..."
            className="flex-1 rounded-xl bg-slate-900 border border-slate-700 px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:border-emerald-500 outline-none"
          />

          <button
            type="submit"
            disabled={posting || !newPostMessage.trim()}
            className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
          >
            <Send className="w-4 h-4" />
            <span>Post</span>
          </button>
        </div>
      </form>

      {/* Feed Posts */}
      <div className="space-y-3">
        {posts.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No updates posted yet. Be the first to share an update with your neighbors.
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1.5 shadow-sm"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{post.author_name}</span>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-900 text-sky-300 border border-slate-700">
                    {post.category.replace(/_/g, ' ')}
                  </span>
                  {post.verified && (
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-slate-400">
                  {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
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
