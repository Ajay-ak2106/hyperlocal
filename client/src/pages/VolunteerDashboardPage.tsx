import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.js';
import { useRealtime } from '../contexts/RealtimeContext.js';
import { api } from '../services/api.js';
import { Incident, Volunteer } from '../types/index.js';
import { calculateDistance } from '../constants/areas.js';
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
  UserCheck,
  BrainCircuit,
  Activity
} from 'lucide-react';

export const VolunteerDashboardPage: React.FC = () => {
  const { user, profile, volunteer, currentArea, coords, switchDemoRole, language } = useAuth();
  const { lastRealtimeEvent } = useRealtime();

  const [incidents, setIncidents] = useState<Incident[]>([]);
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
      const [incData, volData] = await Promise.all([
        api.getIncidents(),
        api.getVolunteers()
      ]);
      setIncidents(incData);
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

  const handleAcceptIncident = async (incidentId: string) => {
    setActionLoadingId(incidentId);
    try {
      // Mark the incident as handled by changing status
      await api.updateIncident(incidentId, { status: 'in_progress' as any });
      await loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUpdateStatus = async (incidentId: string, newStatus: string) => {
    setActionLoadingId(incidentId);
    try {
      await api.updateIncident(incidentId, { status: newStatus as any });
      await loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const calculateAiPriority = (desc: string, severity: string, dist: number) => {
    let score = 0;
    const s = severity.toLowerCase();
    if (s === 'critical') score += 50;
    else if (s === 'high') score += 40;
    else if (s === 'medium') score += 20;
    else score += 10;

    const lowerDesc = desc.toLowerCase();
    
    // Life-threatening keywords
    const lifeThreats = ['trapped', 'drowning', 'bleeding', 'unconscious', 'heart', 'snake', 'electric', 'breath'];
    if (lifeThreats.some(word => lowerDesc.includes(word))) score += 40;

    // Vulnerable population
    const vulnerable = ['children', 'baby', 'pregnant', 'elderly', 'disabled', 'wheelchair'];
    if (vulnerable.some(word => lowerDesc.includes(word))) score += 25;

    // Needs
    const basicNeeds = ['food', 'water', 'fever', 'cut', 'stranded'];
    if (basicNeeds.some(word => lowerDesc.includes(word))) score += 10;

    // Distance factor (closer = slightly higher priority)
    if (dist <= 2) score += 10;
    else if (dist > 10) score -= 10;

    score = Math.min(Math.max(score, 10), 99); // Clamp between 10 and 99

    let tag = 'Standard';
    let color = 'bg-slate-800 text-slate-300';
    if (score >= 85) { tag = 'Life-Threatening'; color = 'bg-rose-900/80 text-rose-200 border border-rose-500/50'; }
    else if (score >= 65) { tag = 'Urgent/Vulnerable'; color = 'bg-orange-900/80 text-orange-200 border border-orange-500/50'; }
    else if (score >= 45) { tag = 'High Priority'; color = 'bg-amber-900/80 text-amber-200 border border-amber-500/50'; }

    return { score, tag, color };
  };

  const pendingIncidents = incidents
    .filter((i) => {
      const s = (i.status || '').toLowerCase();
      return s === 'reported' || s === 'verified';
    })
    .map((inc) => {
      const dist = calculateDistance(coords.latitude, coords.longitude, inc.latitude, inc.longitude);
      const ai = calculateAiPriority(inc.description, inc.severity, dist);
      return { ...inc, distanceKm: dist, ai };
    })
    .sort((a, b) => b.ai.score - a.ai.score || a.distanceKm - b.distanceKm);

  const inProgressIncidents = incidents.filter((i) => {
    const s = (i.status || '').toLowerCase();
    return s === 'in_progress' || s === 'assigned';
  });

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

      {/* Active Incidents In Progress */}
      {inProgressIncidents.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Incidents Currently Being Handled ({inProgressIncidents.length})</span>
          </h2>

          <div className="space-y-3">
            {inProgressIncidents.map((inc) => (
              <div
                key={inc.id}
                className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">
                    🚨 {inc.type.toUpperCase()} • {inc.area}
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-sky-950 text-sky-300 border border-sky-500/40">
                    {inc.status}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{inc.description}</p>

                <div className="pt-2 border-t border-slate-700 flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      disabled={actionLoadingId === inc.id}
                      onClick={() => handleUpdateStatus(inc.id, 'resolved')}
                      className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1 active:scale-95 transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Resolved</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Pending Incidents Queue */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" />
          <span>Reported Incidents Awaiting Volunteer ({pendingIncidents.length})</span>
        </h2>

        {pendingIncidents.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-800/80 border border-slate-700 text-center text-xs text-slate-400">
            All reported incidents are currently being handled.
          </div>
        ) : (
          pendingIncidents.map((inc) => (
            <div
              key={inc.id}
              className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white uppercase">🆘 {inc.type}</span>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                    (inc.severity || '').toLowerCase() === 'critical'
                      ? 'bg-red-900/60 text-red-200'
                      : 'bg-amber-900/60 text-amber-200'
                  }`}>
                    {inc.severity}
                  </span>
                  <span className="text-slate-400">📍 {inc.area} • <strong className="text-emerald-400">{inc.distanceKm.toFixed(1)} km away</strong></span>
                </div>
                <span className="text-slate-400 text-[11px]">
                  {new Date(inc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* AI Priority Badge */}
              <div className={`mt-2 flex items-center justify-between px-3 py-1.5 rounded-lg ${inc.ai.color}`}>
                <div className="flex items-center gap-1.5">
                  <BrainCircuit className="w-4 h-4" />
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">AI Priority: {inc.ai.tag}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 opacity-70" />
                  <span className="text-xs font-black">{inc.ai.score}% Match</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed mt-3">{inc.description}</p>

              <div className="pt-2 border-t border-slate-700 flex items-center justify-between flex-wrap gap-2 text-xs">
                <div>
                  <strong className="text-white">Status: </strong>
                  <span className="text-amber-400">{inc.status}</span>
                </div>

                <button
                  disabled={actionLoadingId === inc.id}
                  onClick={() => handleAcceptIncident(inc.id)}
                  className="py-2 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>I Will Handle This</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
