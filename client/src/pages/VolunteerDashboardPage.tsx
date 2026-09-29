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
      <div className="bg-cyber-panel border border-cyber-cyan/40 p-5 rounded-2xl shadow-neon-cyan flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative">
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyber-cyan"></div>
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyber-cyan"></div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/40 glow-text-cyan">
              [OPERATIVE DISPATCH // VOLUNTEER CORPS HUD]
            </span>
            <span className="text-xs font-mono font-bold text-cyber-green glow-text-green">● STATUS: COMBAT READY</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-mono font-black text-white">
            OPERATIVE {profile?.name?.toUpperCase() || 'SENTHIL KUMAR'} (DISPATCH HUD)
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            DEPLOYED SECTOR: <strong className="text-cyber-cyan">{currentArea}</strong> • GEAR: Inflatable Rescue Boat & 4x4 High-Clearance Rig
          </p>
        </div>

        <button
          onClick={() => switchDemoRole('CITIZEN')}
          className="py-2.5 px-4 rounded bg-cyber-bg hover:bg-cyber-panel text-slate-300 text-xs font-mono font-bold border border-cyber-border hover:border-cyber-green/50 transition-colors"
        >
          SWITCH TO CITIZEN HUD
        </button>
      </div>

      {/* High-Risk Rescue Safety Advisory */}
      <div className="p-4 rounded-xl bg-cyber-bg border border-cyber-amber/50 flex items-start gap-3 shadow-[0_0_15px_rgba(255,183,3,0.15)] font-mono">
        <AlertTriangle className="w-5 h-5 text-cyber-amber flex-shrink-0 mt-0.5" />
        <div className="text-xs text-cyber-amber/90 leading-relaxed">
          <strong className="text-white block mb-0.5">&gt; PROTOCOL DIRECTIVE: VOLUNTEER SAFETY</strong>
          Do not navigate rapid torrents or water depths exceeding 3.5ft without personal flotation devices and paired reconnaissance backup.
        </div>
      </div>

      {/* Skills & Certifications Selector */}
      <div className="p-4 rounded-xl bg-cyber-panel border border-cyber-border space-y-2 font-mono">
        <h3 className="text-xs font-bold text-cyber-cyan uppercase tracking-wider flex items-center gap-1.5 glow-text-cyan">
          <Award className="w-4 h-4 text-cyber-cyan" />
          TACTICAL CERTIFICATIONS & QUALIFICATIONS
        </h3>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {allSkills.map((sk) => {
            const has = mySkills.includes(sk);
            return (
              <button
                key={sk}
                onClick={() => toggleSkill(sk)}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-1 active:scale-95 border ${
                  has
                    ? 'bg-cyber-cyan text-black border-cyber-cyan shadow-[0_0_10px_rgba(0,229,255,0.4)]'
                    : 'bg-cyber-bg text-slate-400 border-cyber-border hover:border-cyber-cyan/40 hover:text-white'
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
        <div className="space-y-3 font-mono">
          <h2 className="text-sm font-black text-cyber-green flex items-center gap-2 glow-text-green">
            <CheckCircle2 className="w-4 h-4" />
            MY ACTIVE SECTOR SORTIES ({myAssignedRequests.length})
          </h2>

          <div className="space-y-3">
            {myAssignedRequests.map((req) => (
              <div
                key={req.id}
                className="p-5 rounded-xl bg-cyber-panel border border-cyber-cyan/50 shadow-neon-cyan space-y-3 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-cyber-cyan">
                    🚨 {req.category} • SECTOR {req.area}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/40">
                    {req.status}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-200 font-sans leading-relaxed">{req.description}</p>

                <div className="pt-2 border-t border-cyber-border flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div>
                    CALLSIGN: <strong className="text-white">{req.citizen_name}</strong>
                    {req.citizen_phone && (
                      <a href={`tel:${req.citizen_phone}`} className="ml-2 text-cyber-green font-bold hover:underline">
                        📞 {req.citizen_phone}
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {req.status === 'ACCEPTED' && (
                      <button
                        disabled={actionLoadingId === req.id}
                        onClick={() => handleUpdateStatus(req.id, 'IN_PROGRESS')}
                        className="py-2 px-3 rounded bg-blue-600/30 border border-blue-500 text-blue-300 hover:bg-blue-600 hover:text-white font-bold text-xs flex items-center gap-1 active:scale-95 transition-colors"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>MARK IN TRANSIT</span>
                      </button>
                    )}

                    {(req.status === 'ACCEPTED' || req.status === 'IN_PROGRESS') && (
                      <button
                        disabled={actionLoadingId === req.id}
                        onClick={() => handleUpdateStatus(req.id, 'COMPLETED')}
                        className="py-2 px-3 rounded bg-cyber-green text-black font-bold text-xs flex items-center gap-1 shadow-neon-green hover:brightness-110 active:scale-95 transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 stroke-[3px]" />
                        <span>CONFIRM RESCUE DONE</span>
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
      <div className="space-y-3 font-mono">
        <h2 className="text-sm font-black text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyber-amber" />
          PENDING EMERGENCY QUEUE AWAITING VOLUNTEER SORTIE ({pendingRequests.length})
        </h2>

        {pendingRequests.length === 0 ? (
          <div className="p-10 rounded-xl bg-cyber-panel border border-cyber-border text-center text-xs text-slate-400">
            ALL SECTOR ALARMS CURRENTLY RESOLVED. MONITORING RADIO TELEMETRY...
          </div>
        ) : (
          pendingRequests.map((req) => (
            <div
              key={req.id}
              className="p-5 rounded-xl bg-cyber-panel border border-cyber-border hover:border-cyber-green/50 shadow-md hover:shadow-neon-green transition-all space-y-3 relative group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">🆘 {req.category}</span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-cyber-red/20 text-cyber-red border border-cyber-red/40">
                    {req.severity}
                  </span>
                  <span className="text-xs text-slate-400">📍 SECTOR: {req.area}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-200 font-sans leading-relaxed">{req.description}</p>

              <div className="pt-2 border-t border-cyber-border flex items-center justify-between flex-wrap gap-2 text-xs">
                <div>
                  CALLSIGN: <strong className="text-white">{req.citizen_name}</strong>
                  {req.citizen_phone && (
                    <a href={`tel:${req.citizen_phone}`} className="ml-2 text-cyber-green hover:underline">
                      📞 {req.citizen_phone}
                    </a>
                  )}
                </div>

                <button
                  disabled={actionLoadingId === req.id}
                  onClick={() => handleAcceptRequest(req.id)}
                  className="py-2.5 px-4 rounded bg-cyber-cyan/20 border border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan hover:text-black font-extrabold text-xs flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,229,255,0.25)] active:scale-95 transition-all touch-target"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>ACCEPT THIS SORTIE</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
