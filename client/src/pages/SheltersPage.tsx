import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { Shelter } from '../types/index.js';
import { useAuth } from '../contexts/AuthContext.js';
import { useRealtime } from '../contexts/RealtimeContext.js';
import {
  Home,
  Utensils,
  Droplet,
  HeartPulse,
  Accessibility,
  PhoneCall,
  MapPin,
  Plus,
  Minus,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const SheltersPage: React.FC = () => {
  const { role, language } = useAuth();
  const { lastRealtimeEvent } = useRealtime();
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(false);
  const [adjustingId, setAdjustingId] = useState<string | null>(null);

  const fetchShelters = async () => {
    try {
      setLoading(true);
      const data = await api.getShelters();
      setShelters(data);
    } catch (e) {
      console.warn('Error fetching shelters:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShelters();
  }, [lastRealtimeEvent]);

  const handleAdjustOccupancy = async (id: string, delta: number) => {
    setAdjustingId(id);
    try {
      await api.updateShelter(id, { change_delta: delta });
      await fetchShelters();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setAdjustingId(null);
    }
  };

  return (
    <div className="pb-24 pt-3 px-3 sm:px-6 max-w-5xl mx-auto space-y-4">
      <div className="bg-cyber-panel border border-cyber-green/40 p-5 rounded-2xl shadow-neon-green relative">
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyber-green"></div>
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyber-green"></div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-cyber-green/10 text-cyber-green border border-cyber-green/40 glow-text-green">
            [GEO-FACILITY // GCC EMERGENCY RELIEF SHELTERS]
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-mono font-black text-white">
          {language === 'ta' ? 'அருகிலுள்ள நிவாரண முகாம்கள்' : 'GCC RELIEF SHELTERS & LIVE CAPACITY'}
        </h1>
        <p className="text-xs font-mono text-slate-400 mt-1 max-w-xl">
          Realtime occupancy telemetry to prevent sector overcrowding and balance logistical supply drops.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {shelters.map((sh) => {
          const occupancyPct = Math.min(100, Math.round((sh.current_occupancy / sh.capacity) * 100));

          const statusColors: Record<string, string> = {
            AVAILABLE: 'bg-cyber-green/15 text-cyber-green border-cyber-green/40',
            LIMITED: 'bg-cyber-amber/15 text-cyber-amber border-cyber-amber/40',
            FULL: 'bg-cyber-red/15 text-cyber-red border-cyber-red/40',
            CLOSED: 'bg-slate-800 text-slate-400 border-slate-700'
          };

          return (
            <div
              key={sh.id}
              className="p-5 rounded-xl bg-cyber-panel border border-cyber-border hover:border-cyber-green/50 transition-all shadow-lg hover:shadow-neon-green flex flex-col justify-between space-y-3 relative group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h3 className="text-sm sm:text-base font-mono font-bold text-white leading-snug">
                    {sh.name}
                  </h3>
                  <span className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded border ${statusColors[sh.status] || 'bg-slate-800'}`}>
                    {sh.status}
                  </span>
                </div>

                <p className="text-xs text-slate-400 flex items-center gap-1 mb-2 font-sans">
                  <MapPin className="w-3.5 h-3.5 text-cyber-red flex-shrink-0" />
                  {sh.address}
                </p>

                {/* Capacity Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300">
                      LOAD: <strong className="text-white font-mono">{sh.current_occupancy}</strong> / {sh.capacity} UNITS
                    </span>
                    <span className="text-cyber-green font-mono font-bold">{occupancyPct}%</span>
                  </div>
                  <div className="w-full h-2 rounded bg-cyber-bg border border-slate-800 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        occupancyPct >= 100
                          ? 'bg-cyber-red shadow-neon-red'
                          : occupancyPct >= 80
                          ? 'bg-cyber-amber'
                          : 'bg-cyber-green shadow-neon-green'
                      }`}
                      style={{ width: `${occupancyPct}%` }}
                    />
                  </div>
                </div>

                {/* Amenities Badges */}
                <div className="flex items-center gap-2 flex-wrap pt-2">
                  {sh.has_food ? (
                    <span className="px-2 py-0.5 rounded bg-cyber-bg border border-cyber-amber/40 text-[10px] font-mono font-bold text-cyber-amber flex items-center gap-1">
                      <Utensils className="w-3 h-3" /> FOOD SUPPLY
                    </span>
                  ) : null}
                  {sh.has_water ? (
                    <span className="px-2 py-0.5 rounded bg-cyber-bg border border-cyber-cyan/40 text-[10px] font-mono font-bold text-cyber-cyan flex items-center gap-1">
                      <Droplet className="w-3 h-3" /> POTABLE WATER
                    </span>
                  ) : null}
                  {sh.has_medical ? (
                    <span className="px-2 py-0.5 rounded bg-cyber-bg border border-cyber-red/40 text-[10px] font-mono font-bold text-cyber-red flex items-center gap-1">
                      <HeartPulse className="w-3 h-3" /> MEDICAL CORPS
                    </span>
                  ) : null}
                  {sh.has_accessibility ? (
                    <span className="px-2 py-0.5 rounded bg-cyber-bg border border-cyber-green/40 text-[10px] font-mono font-bold text-cyber-green flex items-center gap-1">
                      <Accessibility className="w-3 h-3" /> WHEELCHAIR
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Bottom Actions: Contact & Coordinator Occupancy Adjuster */}
              <div className="pt-2 border-t border-cyber-border flex items-center justify-between gap-2 font-mono">
                <a
                  href={`tel:${sh.contact_phone}`}
                  className="py-2 px-3 rounded bg-cyber-bg border border-cyber-border hover:border-cyber-green/50 text-slate-200 text-xs font-bold flex items-center gap-1.5 touch-target transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-cyber-green" />
                  <span>CALL OFFICER: {sh.contact_person}</span>
                </a>

                {/* Coordinator update controls */}
                {(role === 'COMMUNITY_COORDINATOR' || role === 'ADMIN' || role === 'VOLUNTEER') && (
                  <div className="flex items-center gap-1">
                    <button
                      disabled={adjustingId === sh.id || sh.current_occupancy <= 0}
                      onClick={() => handleAdjustOccupancy(sh.id, -5)}
                      className="p-2 rounded bg-cyber-bg border border-cyber-border hover:border-cyber-red text-slate-300 hover:text-cyber-red active:scale-95 disabled:opacity-30"
                      title="Decrease occupancy by 5"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <button
                      disabled={adjustingId === sh.id || sh.current_occupancy >= sh.capacity}
                      onClick={() => handleAdjustOccupancy(sh.id, 5)}
                      className="p-2 rounded bg-cyber-bg border border-cyber-border hover:border-cyber-green text-slate-300 hover:text-cyber-green active:scale-95 disabled:opacity-30"
                      title="Increase occupancy by 5"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
