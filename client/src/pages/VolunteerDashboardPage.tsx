import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.js';
import { useRealtime } from '../contexts/RealtimeContext.js';
import { api } from '../services/api.js';
import { AssistanceRequest, Volunteer } from '../types/index.js';
import {
  LifeBuoy,
  CheckCircle2,
  Clock,
  PlayCircle,
  PhoneCall,
  MapPin,
  AlertTriangle,
  Award,
  Check,
  UserCheck
} from 'lucide-react';

export const VolunteerDashboardPage: React.FC = () => {
  const { user, profile, volunteer, currentArea, switchDemoRole, language } = useAuth();
  const { lastRealtimeEvent } = useRealtime();

  const [requests, setRequests] = useState<AssistanceRequest[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const allSkills = [
    'First Aid', 'CPR', 'Swimming', 'Flood Rescue', 'Boat Operation',
    'Driving', 'Food Distribution', 'Logistics'
  ];
  const [mySkills, setMySkills] = useState<string[]>(volunteer?.skills || ['Flood Rescue', 'Swimming', 'Boat Operation', 'First Aid']);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reqData, volData] = await Promise.all([
        api.getAssistanceRequests(),
        api.getVolunteers()
      ]);
      setRequests(reqData);
      setVolunteers(volData);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [lastRealtimeEvent]);

  const toggleSkill = (skill: string) => {
    setMySkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleAcceptRequest = async (requestId: string) => {
    setActionLoadingId(requestId);
    try {
      await api.acceptAssistanceRequest(requestId, {
        volunteer_id: volunteer?.id || user?.id || 'user-vol-1',
        volunteer_name: volunteer?.full_name || profile?.name || 'Volunteer',
        volunteer_phone: volunteer?.phone || profile?.mobile_number || '+91 98840 99887'
      });
      await loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUpdateStatus = async (requestId: string, newStatus: string) => {
    setActionLoadingId(requestId);
    try {
      await api.updateAssistanceStatus(requestId, newStatus);
      await loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const pendingRequests = requests.filter((r) => r.status === 'PENDING');
  const myAssignedRequests = requests.filter(
    (r) => r.assigned_volunteer_id === user?.id || r.assigned_volunteer_name?.includes(profile?.name || '')
  );

  return (
    <div className="pb-24 pt-3 px-3 sm:px-6 max-w-5xl mx-auto space-y-4">
      {/* Volunteer Header */}
      <div className="bg-slate-900 border border-slate-700 p-5 rounded-2xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-600/40">
              ● Active Volunteer
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            {profile?.name || 'Volunteer'} (Response Dashboard)
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Active Area: <strong className="text-emerald-400">{currentArea}</strong> • Assigned Boat & First Aid Kit
          </p>
        </div>

        <button
          onClick={() => switchDemoRole('CITIZEN')}
          className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
        >
          Switch to Citizen View
        </button>
      </div>

      {/* Volunteer Safety Advisory */}
      <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-200 leading-relaxed">
          <strong className="text-white block mb-0.5">Safety Advisory:</strong>
          Always wear life jackets and do not attempt solo rescue in water exceeding 3.5 feet without companion support.
        </div>
      </div>

      {/* Skills Selector */}
      <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
        <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
          <Award className="w-4 h-4 text-emerald-400" />
          <span>My Verified Skills</span>
        </h3>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {allSkills.map((sk) => {
            const has = mySkills.includes(sk);
            return (
              <button
                key={sk}
                onClick={() => toggleSkill(sk)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 active:scale-95 border ${
                  has
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                {has && <Check className="w-3.5 h-3.5" />}
                <span>{sk}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* My Active Tasks */}
      {myAssignedRequests.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>My Active Assignments ({myAssignedRequests.length})</span>
          </h2>

          <div className="space-y-3">
            {myAssignedRequests.map((req) => (
              <div
                key={req.id}
                className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">
                    🚨 {req.category} • {req.area}
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-sky-950 text-sky-300 border border-sky-500/40">
                    {req.status}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{req.description}</p>

                <div className="pt-2 border-t border-slate-700 flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div>
                    Citizen: <strong className="text-white">{req.citizen_name}</strong>
                    {req.citizen_phone && (
                      <a href={`tel:${req.citizen_phone}`} className="ml-2 text-sky-400 hover:underline">
                        📞 {req.citizen_phone}
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {req.status === 'ACCEPTED' && (
                      <button
                        disabled={actionLoadingId === req.id}
                        onClick={() => handleUpdateStatus(req.id, 'IN_PROGRESS')}
                        className="py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1 active:scale-95 transition-colors"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>En Route</span>
                      </button>
                    )}

                    {(req.status === 'ACCEPTED' || req.status === 'IN_PROGRESS') && (
                      <button
                        disabled={actionLoadingId === req.id}
                        onClick={() => handleUpdateStatus(req.id, 'COMPLETED')}
                        className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1 active:scale-95 transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Resolved</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Pending Requests Queue */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" />
          <span>Pending Citizen Requests Awaiting Volunteer ({pendingRequests.length})</span>
        </h2>

        {pendingRequests.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-800/80 border border-slate-700 text-center text-xs text-slate-400">
            All requests in {currentArea} are currently assigned.
          </div>
        ) : (
          pendingRequests.map((req) => (
            <div
              key={req.id}
              className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">🆘 {req.category}</span>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                    req.severity === 'CRITICAL'
                      ? 'bg-red-900/60 text-red-200'
                      : 'bg-amber-900/60 text-amber-200'
                  }`}>
                    {req.severity}
                  </span>
                  <span className="text-slate-400">📍 {req.area}</span>
                </div>
                <span className="text-slate-400 text-[11px]">
                  {new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{req.description}</p>

              <div className="pt-2 border-t border-slate-700 flex items-center justify-between flex-wrap gap-2 text-xs">
                <div>
                  Citizen: <strong className="text-white">{req.citizen_name}</strong>
                  {req.citizen_phone && (
                    <a href={`tel:${req.citizen_phone}`} className="ml-2 text-sky-400 hover:underline">
                      📞 {req.citizen_phone}
                    </a>
                  )}
                </div>

                <button
                  disabled={actionLoadingId === req.id}
                  onClick={() => handleAcceptRequest(req.id)}
                  className="py-2 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>I Will Help (Accept)</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
