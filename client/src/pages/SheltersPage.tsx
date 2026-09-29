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
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs uppercase font-extrabold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            🏠 Disaster Relief Shelters
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white">
          {language === 'ta' ? 'அருகிலுள்ள நிவாரண முகாம்கள்' : 'Emergency Shelters & Live Capacity'}
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-xl">
          Realtime occupancy tracking to prevent overcrowding and ensure supply distribution.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {shelters.map((sh) => {
          const occupancyPct = Math.min(100, Math.round((sh.current_occupancy / sh.capacity) * 100));

          const statusColors: Record<string, string> = {
            AVAILABLE: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
            LIMITED: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
            FULL: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
            CLOSED: 'bg-slate-700 text-slate-400 border-slate-600'
          };

          return (
            <div
              key={sh.id}
              className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h3 className="text-sm sm:text-base font-extrabold text-white leading-snug">
                    {sh.name}
                  </h3>
                  <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-lg border ${statusColors[sh.status] || 'bg-slate-800'}`}>
                    {sh.status}
                  </span>
                </div>

                <p className="text-xs text-slate-400 flex items-center gap-1 mb-2">
                  <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                  {sh.address}
                </p>

                {/* Capacity Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-300">
                      Occupancy: <strong className="text-white font-mono">{sh.current_occupancy}</strong> / {sh.capacity}
                    </span>
                    <span className="text-slate-400 font-mono font-bold">{occupancyPct}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        occupancyPct >= 100
                          ? 'bg-rose-500'
                          : occupancyPct >= 80
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${occupancyPct}%` }}
                    />
                  </div>
                </div>

                {/* Amenities Badges */}
                <div className="flex items-center gap-2 flex-wrap pt-2">
                  {sh.has_food ? (
                    <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-[10px] font-bold text-amber-300 flex items-center gap-1">
                      <Utensils className="w-3 h-3" /> Food
                    </span>
                  ) : null}
                  {sh.has_water ? (
                    <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-[10px] font-bold text-sky-300 flex items-center gap-1">
                      <Droplet className="w-3 h-3" /> Water
                    </span>
                  ) : null}
                  {sh.has_medical ? (
                    <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-[10px] font-bold text-rose-300 flex items-center gap-1">
                      <HeartPulse className="w-3 h-3" /> Medical
                    </span>
                  ) : null}
                  {sh.has_accessibility ? (
                    <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-[10px] font-bold text-emerald-300 flex items-center gap-1">
                      <Accessibility className="w-3 h-3" /> Wheelchair
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Bottom Actions: Contact & Coordinator Occupancy Adjuster */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                <a
                  href={`tel:${sh.contact_phone}`}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 touch-target"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Call Officer: {sh.contact_person}</span>
                </a>

                {/* Coordinator update controls */}
                {(role === 'COMMUNITY_COORDINATOR' || role === 'ADMIN' || role === 'VOLUNTEER') && (
                  <div className="flex items-center gap-1">
                    <button
                      disabled={adjustingId === sh.id || sh.current_occupancy <= 0}
                      onClick={() => handleAdjustOccupancy(sh.id, -5)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 active:scale-95 disabled:opacity-50"
                      title="Decrease occupancy by 5"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <button
                      disabled={adjustingId === sh.id || sh.current_occupancy >= sh.capacity}
                      onClick={() => handleAdjustOccupancy(sh.id, 5)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 active:scale-95 disabled:opacity-50"
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
