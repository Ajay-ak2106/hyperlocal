import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.js';
import { useRealtime } from '../contexts/RealtimeContext.js';
import { api } from '../services/api.js';
import { AssistanceRequest } from '../types/index.js';
import {
  LifeBuoy,
  Plus,
  CheckCircle2,
  PhoneCall,
  UserCheck,
  PlayCircle,
  Loader2
} from 'lucide-react';
import { RequestHelpModal } from '../components/modals/RequestHelpModal.js';

export const HelpPage: React.FC = () => {
  const { user, profile, role, language } = useAuth();
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

  const handleAcceptRequest = async (requestId: string) => {
    setActionLoadingId(requestId);
    try {
      await api.acceptAssistanceRequest(requestId, {
        volunteer_id: user?.id || 'user-vol-1',
        volunteer_name: profile?.name || 'Volunteer',
        volunteer_phone: profile?.mobile_number || '+91 98840 99887'
      });
      await fetchRequests();
    } catch (err: any) {
      alert('Accept failed: ' + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-700 p-5 rounded-2xl shadow-lg">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <span>🚨</span>
            {language === 'ta' ? 'அவசர உதவி கோரிக்கைகள்' : 'Emergency Help & Rescue'}
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            {language === 'ta'
              ? 'பொதுமக்கள் விடுத்த அவசர உதவி கோரிக்கைகள் மற்றும் மீட்பு பணிகள்.'
              : 'Live citizen assistance requests and volunteer response coordination.'}
          </p>
        </div>

        <button
          onClick={() => setShowRequestModal(true)}
          className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'ta' ? '+ உதவி கோரல்' : '+ Request Help (SOS)'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs">
        <button
          onClick={() => setActiveTab('MY_REQUESTS')}
          className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
            activeTab === 'MY_REQUESTS'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          {language === 'ta' ? 'எனது கோரிக்கைகள்' : 'My Requests'} ({myRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('ALL_REQUESTS')}
          className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
            activeTab === 'ALL_REQUESTS'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          {language === 'ta' ? 'அனைத்து கோரிக்கைகள்' : 'All Requests'} ({requests.length})
        </button>
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        {loading && requests.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
            Loading requests...
          </div>
        ) : displayedRequests.length === 0 ? (
          <div className="p-12 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
            <LifeBuoy className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-white">No Active Requests</h3>
            <p className="text-xs text-slate-400 mt-1">
              {activeTab === 'MY_REQUESTS'
                ? 'You have not submitted any emergency help requests.'
                : 'All area requests have been attended to.'}
            </p>
          </div>
        ) : (
          displayedRequests.map((req) => {
            const isPending = req.status === 'PENDING';
            const isAccepted = req.status === 'ACCEPTED';
            const isInProgress = req.status === 'IN_PROGRESS';
            const isCompleted = req.status === 'COMPLETED';

            const statusColors: Record<string, string> = {
              PENDING: 'bg-amber-950/70 text-amber-300 border-amber-500/40',
              ACCEPTED: 'bg-sky-950/70 text-sky-300 border-sky-500/40',
              IN_PROGRESS: 'bg-blue-950/70 text-blue-300 border-blue-500/40',
              COMPLETED: 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40',
              CANCELLED: 'bg-slate-800 text-slate-400 border-slate-700'
            };

            return (
              <div
                key={req.id}
                className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-slate-600 transition-all shadow-sm space-y-3"
              >
                {/* Top Row */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-white flex items-center gap-1.5">
                      <span>🚨</span>
                      {req.category}
                    </span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                      req.severity === 'CRITICAL'
                        ? 'bg-red-900/60 text-red-200'
                        : req.severity === 'HIGH'
                        ? 'bg-amber-900/60 text-amber-200'
                        : 'bg-slate-700 text-slate-200'
                    }`}>
                      {req.severity}
                    </span>
                    <span className="text-xs text-slate-400">📍 {req.area}</span>
                  </div>

                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusColors[req.status] || 'bg-slate-800'}`}>
                    {req.status.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {req.description}
                </p>

                {/* Contact info */}
                <div className="pt-2 border-t border-slate-700 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="text-slate-300">
                    <span>Contact: <strong className="text-white">{req.citizen_name}</strong></span>
                    {req.citizen_phone && (
                      <a href={`tel:${req.citizen_phone}`} className="ml-2 text-sky-400 hover:underline">
                        📞 {req.citizen_phone}
                      </a>
                    )}
                  </div>

                  {req.assigned_volunteer_name && (
                    <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-emerald-400 text-xs flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Volunteer: <strong className="text-white">{req.assigned_volunteer_name}</strong></span>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="pt-1 flex items-center gap-2 flex-wrap text-xs">
                  {isPending && (
                    <button
                      disabled={actionLoadingId === req.id}
                      onClick={() => handleAcceptRequest(req.id)}
                      className="py-1.5 px-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>I Will Help (Accept)</span>
                    </button>
                  )}

                  {isAccepted && (
                    <button
                      disabled={actionLoadingId === req.id}
                      onClick={() => handleUpdateStatus(req.id, 'IN_PROGRESS')}
                      className="py-1.5 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      <span>Help En Route</span>
                    </button>
                  )}

                  {isInProgress && (
                    <button
                      disabled={actionLoadingId === req.id}
                      onClick={() => handleUpdateStatus(req.id, 'COMPLETED')}
                      className="py-1.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Resolved</span>
                    </button>
                  )}

                  {isCompleted && (
                    <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Resolved
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
