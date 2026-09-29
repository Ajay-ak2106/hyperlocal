import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.js';
import { useRealtime } from '../contexts/RealtimeContext.js';
import { api } from '../services/api.js';
import { AssistanceRequest, Volunteer } from '../types/index.js';
import {
  LifeBuoy,
  Shield,
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
  const { user, profile, volunteer, currentArea, switchDemoRole } = useAuth();
  const { lastRealtimeEvent } = useRealtime();

  const [requests, setRequests] = useState<AssistanceRequest[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Skill checklist state for quick self-registration
  const allSkills = [
    'FIRST AID', 'CPR', 'SWIMMING', 'FLOOD RESCUE', 'BOAT OPERATION',
    'DRIVING', 'FIRE SAFETY', 'FOOD DISTRIBUTION', 'LOGISTICS', 'COMMUNICATION', 'DRONE OPERATION'
  ];
  const [mySkills, setMySkills] = useState<string[]>(volunteer?.skills || ['FLOOD RESCUE', 'SWIMMING', 'BOAT OPERATION', 'FIRST AID']);

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

  // Toggle skills
  const toggleSkill = (skill: string) => {
    setMySkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  // Volunteer Accepts Request (Directly triggers realtime event for citizen!)
  const handleAcceptRequest = async (requestId: string) => {
    setActionLoadingId(requestId);
    try {
      await api.acceptAssistanceRequest(requestId, {
        volunteer_id: volunteer?.id || user?.id || 'user-vol-1',
        volunteer_name: volunteer?.full_name || profile?.name || 'Senthil Kumar (Volunteer)',
        volunteer_phone: volunteer?.phone || profile?.mobile_number || '+91 98840 99887'
      });
      await loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Update Status to IN_PROGRESS or COMPLETED
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
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-extrabold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
              🙋 Rapid Volunteer Network
            </span>
            <span className="text-xs font-bold text-emerald-400">● Status: Active & Ready</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            {profile?.name || 'Senthil Kumar'} (Volunteer Dashboard)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Station: <strong>{currentArea}</strong> • Equipment: Inflatable Rescue Boat & 4x4 Vehicle
          </p>
        </div>

        <button
          onClick={() => switchDemoRole('CITIZEN')}
          className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700"
        >
          Switch to Citizen View
        </button>
      </div>

      {/* High-Risk Rescue Safety Advisory (Requirement #16 & #55) */}
      <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/60 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-200/90 leading-relaxed">
          <strong className="text-white block mb-0.5">⚠️ SAFETY ADVISORY FOR VOLUNTEERS:</strong>
          Do not enter deep floodwater or structural collapses without protective equipment and certified flotation gear.
          Always coordinate swift-water rescues in pairs.
        </div>
      </div>

      {/* Skills & Certifications Selector */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Award className="w-4 h-4 text-rose-400" />
          My Verified Disaster Skills & Qualifications
        </h3>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {allSkills.map((sk) => {
            const has = mySkills.includes(sk);
            return (
              <button
                key={sk}
                onClick={() => toggleSkill(sk)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 active:scale-95 ${
                  has
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-950'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
                }`}
              >
                {has && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                <span>{sk}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* My Active Assignments */}
      {myAssignedRequests.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-black text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            My Active Assignments ({myAssignedRequests.length})
          </h2>

          <div className="space-y-3">
            {myAssignedRequests.map((req) => (
              <div
                key={req.id}
                className="p-5 rounded-3xl bg-blue-950/30 border border-blue-800/80 shadow-xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-blue-300">
                    🆘 {req.category} • {req.area}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {req.status}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-200 font-semibold">{req.description}</p>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div>
                    Citizen: <strong className="text-white">{req.citizen_name}</strong>
                    {req.citizen_phone && (
                      <a href={`tel:${req.citizen_phone}`} className="ml-2 text-rose-400 font-bold hover:underline">
                        📞 {req.citizen_phone}
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {req.status === 'ACCEPTED' && (
                      <button
                        disabled={actionLoadingId === req.id}
                        onClick={() => handleUpdateStatus(req.id, 'IN_PROGRESS')}
                        className="py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-indigo-950 active:scale-95"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>MARK IN PROGRESS</span>
                      </button>
                    )}

                    {(req.status === 'ACCEPTED' || req.status === 'IN_PROGRESS') && (
                      <button
                        disabled={actionLoadingId === req.id}
                        onClick={() => handleUpdateStatus(req.id, 'COMPLETED')}
                        className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-emerald-950 active:scale-95"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>MARK COMPLETED</span>
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
        <h2 className="text-sm font-black text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" />
          Pending Emergency Requests Awaiting Response ({pendingRequests.length})
        </h2>

        {pendingRequests.length === 0 ? (
          <div className="p-10 rounded-3xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
            No pending help requests in your ward right now. Excellent!
          </div>
        ) : (
          pendingRequests.map((req) => (
            <div
              key={req.id}
              className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-white">🆘 {req.category}</span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {req.severity}
                  </span>
                  <span className="text-xs text-slate-400">📍 {req.area}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-200 font-medium">{req.description}</p>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
                <div>
                  Citizen: <strong className="text-white">{req.citizen_name}</strong>
                  {req.citizen_phone && (
                    <a href={`tel:${req.citizen_phone}`} className="ml-2 text-rose-400 hover:underline">
                      📞 {req.citizen_phone}
                    </a>
                  )}
                </div>

                <button
                  disabled={actionLoadingId === req.id}
                  onClick={() => handleAcceptRequest(req.id)}
                  className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-blue-950 active:scale-95 touch-target"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>ACCEPT THIS REQUEST</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
