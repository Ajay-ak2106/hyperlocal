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
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-extrabold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
              🏛️ Disaster Emergency Control HQ
            </span>
            <span className="text-xs font-mono text-emerald-400">● LIVE DB SYNC</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            State Disaster Management Central Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Realtime multi-agency coordination, incident verification, and volunteer dispatch.
          </p>
        </div>

        <button
          onClick={() => switchDemoRole('CITIZEN')}
          className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 active:scale-95"
        >
          Exit to Citizen View
        </button>
      </div>

      {/* Real Live KPI Stat Cards (Requirement #26 - Calculated from real DB, never hard-coded) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Active Incidents */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-2">
            <span>ACTIVE INCIDENTS</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-400 font-mono">
            {activeIncidents.length}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Live across all sectors</span>
        </div>

        {/* Open Help Requests */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-2">
            <span>OPEN AID QUEUE</span>
            <LifeBuoy className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
            {openHelpRequests.length}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Awaiting / in transit</span>
        </div>

        {/* Available Volunteers */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-2">
            <span>VOLUNTEERS</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-400 font-mono">
            {volunteers.length}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Trained & deployable</span>
        </div>

        {/* Shelters Occupancy */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-2">
            <span>SHELTER OCCUPANCY</span>
            <Home className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
            {totalShelterOccupancy} <span className="text-xs text-slate-400 font-normal">/ {totalShelterCapacity}</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">{shelters.length} safe centers</span>
        </div>

        {/* Safety Check-in Ratio */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-2">
            <span>SAFETY RESPONDENTS</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            🟢 {safetySummary.SAFE} <span className="text-xs text-rose-400">🔴 {safetySummary.EMERGENCY}</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">From {safetySummary.TOTAL} total check-ins</span>
        </div>
      </div>

      {/* Incident Verification & Status Management Queue (Requirement #27) */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            Incident Verification Queue (Community Reports)
          </h2>
          <span className="text-xs text-slate-500">{incidents.length} Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                <th className="pb-2.5">Type & Severity</th>
                <th className="pb-2.5">Ward / Location</th>
                <th className="pb-2.5">Description</th>
                <th className="pb-2.5">Reporter</th>
                <th className="pb-2.5">Verification</th>
                <th className="pb-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {incidents.slice(0, 10).map((inc) => (
                <tr key={inc.id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="py-3 pr-2">
                    <span className="font-extrabold text-white block">{inc.type}</span>
                    <span
                      className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                        inc.severity === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-300'
                          : inc.severity === 'HIGH'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {inc.severity}
                    </span>
                  </td>

                  <td className="py-3 pr-2 font-semibold text-slate-200">
                    📍 {inc.area}
                  </td>

                  <td className="py-3 pr-3 text-slate-300 max-w-xs truncate">
                    {inc.description}
                  </td>

                  <td className="py-3 pr-2 text-slate-400">
                    {inc.reporter_name || 'Anonymous'}
                  </td>

                  <td className="py-3 pr-2">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                        inc.verification_status === 'VERIFIED'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : inc.verification_status === 'REJECTED'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse'
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
                          className="py-1 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] flex items-center gap-1 active:scale-95"
                          title="Verify Incident"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Verify</span>
                        </button>
                      )}

                      {inc.verification_status !== 'REJECTED' && (
                        <button
                          disabled={verifyingId === inc.id}
                          onClick={() => handleVerifyIncident(inc.id, 'REJECTED')}
                          className="py-1 px-2.5 rounded-lg bg-slate-800 hover:bg-rose-600/30 text-rose-300 font-extrabold text-[11px] flex items-center gap-1 active:scale-95"
                          title="Reject / False Alarm"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
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
