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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <LifeBuoy className="w-6 h-6 text-rose-500" />
            {language === 'ta' ? 'அவசர உதவி மையம்' : 'Emergency Assistance Hub'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Realtime two-way coordination between citizens in danger and active volunteers.
          </p>
        </div>

        <button
          onClick={() => setShowRequestModal(true)}
          className="py-3 px-5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 font-extrabold text-xs text-white shadow-xl shadow-rose-950 flex items-center justify-center gap-2 active:scale-95 transition-all touch-target"
        >
          <Plus className="w-4 h-4 stroke-[3px]" />
          <span>{language === 'ta' ? 'உதவி கோரல்' : 'REQUEST NEW AID'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
        <button
          onClick={() => setActiveTab('MY_REQUESTS')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${
            activeTab === 'MY_REQUESTS'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-950'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {language === 'ta' ? 'எனது கோரிக்கைகள்' : 'My Requests'} ({myRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('ALL_REQUESTS')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${
            activeTab === 'ALL_REQUESTS'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-950'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {language === 'ta' ? 'அனைத்து நேரலைக் கோரிக்கைகள்' : 'Live Community Aid Queue'} ({requests.length})
        </button>
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        {loading && requests.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
            Loading live requests from database...
          </div>
        ) : displayedRequests.length === 0 ? (
          <div className="p-12 rounded-3xl bg-slate-900/60 border border-slate-800 text-center">
            <LifeBuoy className="w-12 h-12 text-slate-600 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-white">No active requests found</h3>
            <p className="text-xs text-slate-400 mt-1">
              {activeTab === 'MY_REQUESTS'
                ? 'You have not submitted any emergency requests yet.'
                : 'All requests in this sector have been resolved.'}
            </p>
          </div>
        ) : (
          displayedRequests.map((req) => {
            const isPending = req.status === 'PENDING';
            const isAccepted = req.status === 'ACCEPTED';
            const isInProgress = req.status === 'IN_PROGRESS';
            const isCompleted = req.status === 'COMPLETED';

            const statusColors: Record<string, string> = {
              PENDING: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
              ACCEPTED: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
              IN_PROGRESS: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
              COMPLETED: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
              CANCELLED: 'bg-slate-700 text-slate-400 border-slate-600'
            };

            return (
              <div
                key={req.id}
                className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl transition-all space-y-3"
              >
                {/* Top Row: Category, Urgency, Status */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-white flex items-center gap-1.5">
                      <span className="text-rose-500">🆘</span>
                      {req.category}
                    </span>
                    <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {req.severity}
                    </span>
                    <span className="text-xs text-slate-400">📍 {req.area}</span>
                  </div>

                  <span className={`text-[11px] font-black uppercase px-2.5 py-1 rounded-xl border ${statusColors[req.status] || 'bg-slate-800'}`}>
                    {req.status.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                  {req.description}
                </p>

                {/* Citizen and Volunteer Coordination Info */}
                <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="text-slate-400">
                    <span>Citizen: <strong className="text-slate-200">{req.citizen_name}</strong></span>
                    {req.citizen_phone && (
                      <a href={`tel:${req.citizen_phone}`} className="ml-2 text-rose-400 hover:underline">
                        📞 {req.citizen_phone}
                      </a>
                    )}
                  </div>

                  {req.assigned_volunteer_name && (
                    <div className="p-2 rounded-xl bg-blue-950/40 border border-blue-800/60 flex items-center gap-2 text-blue-200 text-xs">
                      <UserCheck className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      <span>
                        Assigned Volunteer: <strong className="text-white">{req.assigned_volunteer_name}</strong>
                      </span>
                      {req.assigned_volunteer_phone && (
                        <a href={`tel:${req.assigned_volunteer_phone}`} className="font-bold text-sky-400 hover:underline">
                          📞 {req.assigned_volunteer_phone}
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons for Realtime Demonstration (Accept -> In Progress -> Completed) */}
                <div className="pt-2 flex items-center gap-2 flex-wrap">
                  {isPending && (
                    <button
                      disabled={actionLoadingId === req.id}
                      onClick={() => handleAcceptRequest(req.id)}
                      className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-blue-950 active:scale-95 touch-target"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>ACCEPT REQUEST</span>
                    </button>
                  )}

                  {isAccepted && (
                    <button
                      disabled={actionLoadingId === req.id}
                      onClick={() => handleUpdateStatus(req.id, 'IN_PROGRESS')}
                      className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-950 active:scale-95 touch-target"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>MARK IN PROGRESS ("Help is on the way")</span>
                    </button>
                  )}

                  {isInProgress && (
                    <button
                      disabled={actionLoadingId === req.id}
                      onClick={() => handleUpdateStatus(req.id, 'COMPLETED')}
                      className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950 active:scale-95 touch-target"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>MARK COMPLETED</span>
                    </button>
                  )}

                  {isCompleted && (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Aid successfully rendered. Stay safe!
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
