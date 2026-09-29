import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { Incident, AssistanceRequest, Volunteer, Shelter, SafetySummary } from '../types/index.js';
import { useRealtime } from '../contexts/RealtimeContext.js';
import { useAuth } from '../contexts/AuthContext.js';
import {
  ShieldAlert,
  AlertTriangle,
  LifeBuoy,
  Users,
  Home,
  CheckCircle2,
  XCircle,
  Clock,
  Radio,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Loader2
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { user, profile, switchDemoRole } = useAuth();
  const { lastRealtimeEvent } = useRealtime();

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [requests, setRequests] = useState<AssistanceRequest[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [safetySummary, setSafetySummary] = useState<SafetySummary>({ SAFE: 0, NEED_HELP: 0, EMERGENCY: 0, NO_RESPONSE: 0, TOTAL: 0 });
  const [loading, setLoading] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [incData, reqData, volData, shData, safetyData] = await Promise.all([
        api.getIncidents(),
        api.getAssistanceRequests(),
        api.getVolunteers(),
        api.getShelters(),
        api.getSafetyStats()
      ]);
      setIncidents(incData);
      setRequests(reqData);
      setVolunteers(volData);
      setShelters(shData);
      setSafetySummary(safetyData.summary);
    } catch (e) {
      console.warn('Dashboard fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [lastRealtimeEvent]);

  // Admin verifies incident
  const handleVerifyIncident = async (id: string, newVerificationStatus: 'VERIFIED' | 'REJECTED') => {
    setVerifyingId(id);
    try {
      await api.updateIncident(id, {
        verification_status: newVerificationStatus,
        verified_by: user?.id || 'user-admin-1',
        verification_notes: `Verified by State Disaster HQ Admin at ${new Date().toLocaleTimeString()}`
      });
      await fetchDashboardData();
    } catch (err: any) {
      alert('Verification update failed: ' + err.message);
    } finally {
      setVerifyingId(null);
    }
  };

  // Live KPI counters directly calculated from database arrays
  const activeIncidents = incidents.filter((i) => i.status !== 'RESOLVED' && i.status !== 'REJECTED');
  const openHelpRequests = requests.filter((r) => r.status === 'PENDING' || r.status === 'IN_PROGRESS');
  const totalShelterCapacity = shelters.reduce((acc, s) => acc + s.capacity, 0);
  const totalShelterOccupancy = shelters.reduce((acc, s) => acc + s.current_occupancy, 0);

  return (
    <div className="pb-24 pt-3 px-3 sm:px-6 max-w-7xl mx-auto space-y-5">
      {/* Admin Title Header */}
      <div className="bg-cyber-panel border border-cyber-green/40 p-5 rounded-2xl shadow-neon-green flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative">
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyber-green"></div>
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyber-green"></div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-cyber-red/15 text-cyber-red border border-cyber-red/40 glow-text-red">
              [COMMAND OVERVIEW // STATE DISASTER OPS HQ]
            </span>
            <span className="text-xs font-mono font-bold text-cyber-green glow-text-green">● LIVE DB TELEMETRY STREAM</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-mono font-black text-white">
            CENTRAL CRISIS COMMAND & INTELLIGENCE HUD
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Realtime multi-agency coordination, incident verification, shelter load balancing, and volunteer sortie dispatch.
          </p>
        </div>

        <button
          onClick={() => switchDemoRole('CITIZEN')}
          className="py-2.5 px-4 rounded bg-cyber-bg hover:bg-cyber-panel text-slate-300 text-xs font-mono font-bold border border-cyber-border hover:border-cyber-green/50 active:scale-95 transition-colors"
        >
          SWITCH TO CITIZEN HUD
        </button>
      </div>

      {/* Real Live KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 font-mono">
        {/* Active Incidents */}
        <div className="p-4 rounded-xl bg-cyber-panel border border-cyber-red/40 shadow-[0_0_15px_rgba(255,42,85,0.15)] relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-2">
            <span>ACTIVE INCIDENTS</span>
            <AlertTriangle className="w-4 h-4 text-cyber-red animate-pulse" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-cyber-red glow-text-red">
            {activeIncidents.length}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">CRITICAL SECTORS ACTIVE</span>
        </div>

        {/* Open Help Requests */}
        <div className="p-4 rounded-xl bg-cyber-panel border border-cyber-amber/40 shadow-[0_0_15px_rgba(255,183,3,0.15)] relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-2">
            <span>OPEN SOS QUEUE</span>
            <LifeBuoy className="w-4 h-4 text-cyber-amber animate-spin-slow" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-cyber-amber">
            {openHelpRequests.length}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">AWAITING / IN TRANSIT</span>
        </div>

        {/* Available Volunteers */}
        <div className="p-4 rounded-xl bg-cyber-panel border border-cyber-cyan/40 shadow-[0_0_15px_rgba(0,229,255,0.15)] relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-2">
            <span>OPERATIVE CORPS</span>
            <Users className="w-4 h-4 text-cyber-cyan" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-cyber-cyan glow-text-cyan">
            {volunteers.length}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">TRAINED & DEPLOYED</span>
        </div>

        {/* Shelters Occupancy */}
        <div className="p-4 rounded-xl bg-cyber-panel border border-cyber-green/40 shadow-neon-green relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-2">
            <span>SHELTER CAPACITY</span>
            <Home className="w-4 h-4 text-cyber-green" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-cyber-green glow-text-green">
            {totalShelterOccupancy} <span className="text-xs text-slate-400 font-normal">/ {totalShelterCapacity}</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">{shelters.length} DESIGNATED FACILITIES</span>
        </div>

        {/* Safety Check-in Ratio */}
        <div className="p-4 rounded-xl bg-cyber-panel border border-slate-700 shadow-md col-span-2 lg:col-span-1 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-2">
            <span>SAFETY STATUS</span>
            <ShieldCheck className="w-4 h-4 text-cyber-green" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            <span className="text-cyber-green">{safetySummary.SAFE}</span> <span className="text-xs text-cyber-red">/ {safetySummary.EMERGENCY} SOS</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">FROM {safetySummary.TOTAL} CITIZEN LOGS</span>
        </div>
      </div>

      {/* Incident Verification & Status Management Queue */}
      <div className="bg-cyber-panel border border-cyber-border p-5 rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center justify-between font-mono">
          <h2 className="text-sm font-black text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-cyber-red" />
            INCIDENT VERIFICATION ROSTER (FIELD TELEMETRY)
          </h2>
          <span className="text-xs text-cyber-cyan">{incidents.length} RECORDS IN BUFFER</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-cyber-border text-slate-400 font-bold uppercase text-[10px]">
                <th className="pb-2.5">SECTOR / SEVERITY</th>
                <th className="pb-2.5">LOCATION</th>
                <th className="pb-2.5">FIELD REPORT</th>
                <th className="pb-2.5">REPORTER</th>
                <th className="pb-2.5">VERIFICATION</th>
                <th className="pb-2.5 text-right">COMMAND ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border/60">
              {incidents.slice(0, 10).map((inc) => (
                <tr key={inc.id} className="hover:bg-cyber-bg/50 transition-colors">
                  <td className="py-3 pr-2">
                    <span className="font-bold text-white block">[{inc.type}]</span>
                    <span
                      className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                        inc.severity === 'CRITICAL'
                          ? 'bg-cyber-red/20 text-cyber-red border-cyber-red/40'
                          : inc.severity === 'HIGH'
                          ? 'bg-cyber-amber/20 text-cyber-amber border-cyber-amber/40'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {inc.severity}
                    </span>
                  </td>

                  <td className="py-3 pr-2 font-bold text-slate-200">
                    📍 {inc.area}
                  </td>

                  <td className="py-3 pr-3 text-slate-300 max-w-xs truncate font-sans">
                    {inc.description}
                  </td>

                  <td className="py-3 pr-2 text-slate-400">
                    {inc.reporter_name || 'ANONYMOUS'}
                  </td>

                  <td className="py-3 pr-2">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                        inc.verification_status === 'VERIFIED'
                          ? 'bg-cyber-green/15 text-cyber-green border-cyber-green/40'
                          : inc.verification_status === 'REJECTED'
                          ? 'bg-cyber-red/15 text-cyber-red border-cyber-red/40'
                          : 'bg-cyber-amber/15 text-cyber-amber border-cyber-amber/40 animate-pulse'
                      }`}
                    >
                      {inc.verification_status}
                    </span>
                  </td>

                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {inc.verification_status !== 'VERIFIED' && (
                        <button
                          disabled={verifyingId === inc.id}
                          onClick={() => handleVerifyIncident(inc.id, 'VERIFIED')}
                          className="py-1 px-2.5 rounded bg-cyber-green text-black font-extrabold text-[11px] flex items-center gap-1 hover:brightness-110 active:scale-95 shadow-neon-green"
                          title="Verify Incident"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>VERIFY</span>
                        </button>
                      )}

                      {inc.verification_status !== 'REJECTED' && (
                        <button
                          disabled={verifyingId === inc.id}
                          onClick={() => handleVerifyIncident(inc.id, 'REJECTED')}
                          className="py-1 px-2.5 rounded bg-cyber-bg border border-cyber-red text-cyber-red hover:bg-cyber-red hover:text-white font-extrabold text-[11px] flex items-center gap-1 active:scale-95 transition-colors"
                          title="Reject / False Alarm"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>REJECT</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
