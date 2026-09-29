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
  ShieldCheck,
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

  const handleVerifyIncident = async (id: string, newVerificationStatus: 'VERIFIED' | 'REJECTED') => {
    setVerifyingId(id);
    try {
      await api.updateIncident(id, {
        verification_status: newVerificationStatus,
        verified_by: user?.id || 'user-admin-1',
        verification_notes: `Verified by GCC Admin at ${new Date().toLocaleTimeString()}`
      });
      await fetchDashboardData();
    } catch (err: any) {
      alert('Verification update failed: ' + err.message);
    } finally {
      setVerifyingId(null);
    }
  };

  const activeIncidents = incidents.filter((i) => i.status !== 'RESOLVED' && i.status !== 'REJECTED');
  const openHelpRequests = requests.filter((r) => r.status === 'PENDING' || r.status === 'IN_PROGRESS');
  const totalShelterCapacity = shelters.reduce((acc, s) => acc + s.capacity, 0);
  const totalShelterOccupancy = shelters.reduce((acc, s) => acc + s.current_occupancy, 0);

  return (
    <div className="pb-24 pt-3 px-3 sm:px-6 max-w-7xl mx-auto space-y-5">
      {/* Admin Title Header */}
      <div className="bg-slate-900 border border-slate-700 p-5 rounded-2xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-600/40">
              ● Official Admin Portal
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            Disaster Management & Verification Center
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Incident verification, shelter management, and assistance request coordination.
          </p>
        </div>

        <button
          onClick={() => switchDemoRole('CITIZEN')}
          className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
        >
          Switch to Citizen View
        </button>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Active Incidents */}
        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
            <span>Active Incidents</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-red-400">
            {activeIncidents.length}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Reported in sector</span>
        </div>

        {/* Open Help Requests */}
        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
            <span>Open Help Requests</span>
            <LifeBuoy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-400">
            {openHelpRequests.length}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Pending or en route</span>
        </div>

        {/* Volunteers */}
        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
            <span>Volunteers</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-sky-400">
            {volunteers.length}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Registered responders</span>
        </div>

        {/* Shelter Occupancy */}
        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
            <span>Shelter Occupancy</span>
            <Home className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-400">
            {totalShelterOccupancy} <span className="text-xs text-slate-400 font-normal">/ {totalShelterCapacity}</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">{shelters.length} relief camps</span>
        </div>

        {/* Safety Counts */}
        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
            <span>Safety Check-ins</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white">
            <span className="text-emerald-400">{safetySummary.SAFE}</span> <span className="text-xs text-red-400">/ {safetySummary.EMERGENCY} SOS</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Out of {safetySummary.TOTAL} citizens</span>
        </div>
      </div>

      {/* Incident Verification Table */}
      <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span>Incident Verification Queue</span>
          </h2>
          <span className="text-xs text-slate-400">{incidents.length} total reports</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 font-semibold uppercase text-[11px]">
                <th className="pb-2.5">Type & Severity</th>
                <th className="pb-2.5">Area</th>
                <th className="pb-2.5">Description</th>
                <th className="pb-2.5">Status</th>
                <th className="pb-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {incidents.slice(0, 10).map((inc) => (
                <tr key={inc.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3">
                    <span className="font-bold text-white block">{inc.type}</span>
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      inc.severity === 'CRITICAL' ? 'bg-red-900/60 text-red-200' : 'bg-slate-700 text-slate-300'
                    }`}>
                      {inc.severity}
                    </span>
                  </td>
                  <td className="py-3 text-slate-300 font-medium">📍 {inc.area}</td>
                  <td className="py-3 text-slate-300 max-w-xs truncate">{inc.description}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      inc.verification_status === 'VERIFIED'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/40'
                        : inc.verification_status === 'REJECTED'
                        ? 'bg-red-950 text-red-300 border border-red-600/40'
                        : 'bg-amber-950 text-amber-300 border border-amber-600/40'
                    }`}>
                      {inc.verification_status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    {inc.verification_status === 'UNVERIFIED' && (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          disabled={verifyingId === inc.id}
                          onClick={() => handleVerifyIncident(inc.id, 'VERIFIED')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] flex items-center gap-1 transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Verify</span>
                        </button>
                        <button
                          disabled={verifyingId === inc.id}
                          onClick={() => handleVerifyIncident(inc.id, 'REJECTED')}
                          className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-[11px] flex items-center gap-1 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}
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
