import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.js';
import { useRealtime } from '../contexts/RealtimeContext.js';
import { api } from '../services/api.js';
import { AssistanceRequest } from '../types/index.js';
import {
  LifeBuoy,
  Plus,
  Clock,
  CheckCircle2,
  PhoneCall,
  UserCheck,
  AlertTriangle,
  PlayCircle,
  ShieldCheck,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { RequestHelpModal } from '../components/modals/RequestHelpModal.js';

export const HelpPage: React.FC = () => {
  const { user, profile, role, currentArea, language } = useAuth();
  const { lastRealtimeEvent } = useRealtime();

  const [requests, setRequests] = useState<AssistanceRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'MY_REQUESTS' | 'ALL_REQUESTS'>(
    role === 'VOLUNTEER' ? 'ALL_REQUESTS' : 'MY_REQUESTS'
  );
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await api.getAssistanceRequests();
      setRequests(data);
    } catch (e) {
      console.warn('Error fetching assistance requests:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [lastRealtimeEvent]);

  // Volunteer Accepts Request
  const handleAcceptRequest = async (requestId: string) => {
    setActionLoadingId(requestId);
    try {
      await api.acceptAssistanceRequest(requestId, {
        volunteer_id: user?.id || 'user-vol-1',
        volunteer_name: profile?.name || 'Senthil Kumar (Volunteer)',
        volunteer_phone: profile?.mobile_number || '+91 98840 99887'
      });
      await fetchRequests();
    } catch (err: any) {
      alert('Accept failed: ' + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Volunteer or Citizen Updates Status
  const handleUpdateStatus = async (requestId: string, newStatus: string) => {
    setActionLoadingId(requestId);
    try {
      await api.updateAssistanceStatus(requestId, newStatus);
      await fetchRequests();
    } catch (err: any) {
      alert('Status update failed: ' + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const myRequests = requests.filter((r) => r.citizen_id === user?.id || r.citizen_name === profile?.name);
  const displayedRequests = activeTab === 'MY_REQUESTS' ? myRequests : requests;

  return (
    <div className="pb-24 pt-3 px-3 sm:px-6 max-w-5xl mx-auto space-y-4">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-cyber-panel border border-cyber-red/40 p-5 rounded-2xl shadow-neon-red relative">
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyber-red"></div>
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyber-red"></div>

        <div>
          <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-cyber-red/15 text-cyber-red border border-cyber-red/40 glow-text-red">
            [CRISIS CORPS // TWO-WAY TACTICAL DISPATCH]
          </span>
          <h1 className="text-xl sm:text-2xl font-mono font-black text-white flex items-center gap-2 mt-1">
            <LifeBuoy className="w-6 h-6 text-cyber-red animate-spin-slow" />
            {language === 'ta' ? 'அவசர உதவி மையம்' : 'CITIZEN AID & RESCUE DISPATCH'}
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Realtime bidirectional coordination link between citizens in danger and frontline response volunteers.
          </p>
        </div>

        <button
          onClick={() => setShowRequestModal(true)}
          className="py-3 px-5 rounded bg-cyber-red text-white hover:brightness-110 font-mono font-bold text-xs shadow-neon-red flex items-center justify-center gap-2 active:scale-95 transition-all touch-target"
        >
          <Plus className="w-4 h-4 stroke-[3px]" />
          <span>{language === 'ta' ? 'உதவி கோரல்' : '+ TRANSMIT SOS AID REQUEST'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-xl bg-cyber-panel border border-cyber-border font-mono">
        <button
          onClick={() => setActiveTab('MY_REQUESTS')}
          className={`flex-1 py-2.5 rounded text-xs font-bold transition-all ${
            activeTab === 'MY_REQUESTS'
              ? 'bg-cyber-green text-black shadow-neon-green'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {language === 'ta' ? 'எனது கோரிக்கைகள்' : 'MY ACTIVE SIGNALS'} ({myRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('ALL_REQUESTS')}
          className={`flex-1 py-2.5 rounded text-xs font-bold transition-all ${
            activeTab === 'ALL_REQUESTS'
              ? 'bg-cyber-green text-black shadow-neon-green'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {language === 'ta' ? 'அனைத்து நேரலைக் கோரிக்கைகள்' : 'ALL SECTOR QUEUE'} ({requests.length})
        </button>
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        {loading && requests.length === 0 ? (
          <div className="py-12 text-center text-xs font-mono text-cyber-green flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-cyber-green" />
            SYNCHRONIZING WITH DISASTER TELEMETRY FEED...
          </div>
        ) : displayedRequests.length === 0 ? (
          <div className="p-12 rounded-xl bg-cyber-panel border border-cyber-border text-center">
            <LifeBuoy className="w-12 h-12 text-slate-700 mx-auto mb-2" />
            <h3 className="text-sm font-mono font-bold text-white">NO ACTIVE DISPATCH REQUESTS FOUND</h3>
            <p className="text-xs font-mono text-slate-400 mt-1">
              {activeTab === 'MY_REQUESTS'
                ? 'You have not transmitted any emergency SOS requests yet.'
                : 'All sector requests have been verified and resolved by frontline teams.'}
            </p>
          </div>
        ) : (
          displayedRequests.map((req) => {
            const isPending = req.status === 'PENDING';
            const isAccepted = req.status === 'ACCEPTED';
            const isInProgress = req.status === 'IN_PROGRESS';
            const isCompleted = req.status === 'COMPLETED';

            const statusColors: Record<string, string> = {
              PENDING: 'bg-cyber-amber/15 text-cyber-amber border-cyber-amber/40',
              ACCEPTED: 'bg-cyber-cyan/15 text-cyber-cyan border-cyber-cyan/40',
              IN_PROGRESS: 'bg-blue-500/15 text-blue-300 border-blue-500/40',
              COMPLETED: 'bg-cyber-green/15 text-cyber-green border-cyber-green/40',
              CANCELLED: 'bg-slate-800 text-slate-400 border-slate-700'
            };

            return (
              <div
                key={req.id}
                className="p-5 rounded-xl bg-cyber-panel border border-cyber-border hover:border-cyber-green/50 shadow-lg hover:shadow-neon-green transition-all space-y-3 relative group"
              >
                {/* Top Row: Category, Urgency, Status */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-mono font-bold text-white flex items-center gap-1.5">
                      <span className="text-cyber-red">🚨</span>
                      {req.category}
                    </span>
                    <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-cyber-red/20 text-cyber-red border border-cyber-red/40">
                      PRIORITY: {req.severity}
                    </span>
                    <span className="text-xs font-mono text-slate-400">📍 SECTOR: {req.area}</span>
                  </div>

                  <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded border ${statusColors[req.status] || 'bg-slate-800'}`}>
                    {req.status.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-200 font-sans leading-relaxed">
                  {req.description}
                </p>

                {/* Citizen and Volunteer Coordination Info */}
                <div className="pt-3 border-t border-cyber-border flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                  <div className="text-slate-400">
                    <span>CALLSIGN: <strong className="text-white">{req.citizen_name}</strong></span>
                    {req.citizen_phone && (
                      <a href={`tel:${req.citizen_phone}`} className="ml-2 text-cyber-green hover:underline">
                        📞 {req.citizen_phone}
                      </a>
                    )}
                  </div>

                  {req.assigned_volunteer_name && (
                    <div className="p-2 rounded bg-cyber-bg border border-cyber-cyan/40 flex items-center gap-2 text-cyber-cyan text-xs">
                      <UserCheck className="w-4 h-4 text-cyber-cyan flex-shrink-0" />
                      <span>
                        ASSIGNED OPERATIVE: <strong className="text-white">{req.assigned_volunteer_name}</strong>
                      </span>
                      {req.assigned_volunteer_phone && (
                        <a href={`tel:${req.assigned_volunteer_phone}`} className="font-bold text-cyber-cyan hover:underline">
                          📞 {req.assigned_volunteer_phone}
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons for Realtime Demonstration */}
                <div className="pt-2 flex items-center gap-2 flex-wrap font-mono">
                  {isPending && (
                    <button
                      disabled={actionLoadingId === req.id}
                      onClick={() => handleAcceptRequest(req.id)}
                      className="py-2 px-4 rounded bg-cyber-cyan/20 border border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan hover:text-black font-bold text-xs flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,229,255,0.25)] active:scale-95 transition-all touch-target"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>ACCEPT DISPATCH</span>
                    </button>
                  )}

                  {isAccepted && (
                    <button
                      disabled={actionLoadingId === req.id}
                      onClick={() => handleUpdateStatus(req.id, 'IN_PROGRESS')}
                      className="py-2 px-4 rounded bg-blue-600/30 border border-blue-500 text-blue-300 hover:bg-blue-600 hover:text-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all touch-target"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>MARK IN TRANSIT ("Help En Route")</span>
                    </button>
                  )}

                  {isInProgress && (
                    <button
                      disabled={actionLoadingId === req.id}
                      onClick={() => handleUpdateStatus(req.id, 'COMPLETED')}
                      className="py-2 px-4 rounded bg-cyber-green text-black font-bold text-xs flex items-center gap-1.5 shadow-neon-green hover:brightness-110 active:scale-95 transition-all touch-target"
                    >
                      <CheckCircle2 className="w-4 h-4 stroke-[3px]" />
                      <span>CONFIRM RESCUE COMPLETE</span>
                    </button>
                  )}

                  {isCompleted && (
                    <span className="text-xs font-mono font-bold text-cyber-green flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      RESCUE COMPLETED // SECTOR SECURE
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <RequestHelpModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onSuccess={fetchRequests}
      />
    </div>
  );
};
