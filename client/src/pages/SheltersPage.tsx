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
  Minus
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
      <div className="bg-slate-900 border border-slate-700 p-5 rounded-2xl shadow-lg">
        <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <span>🏠</span>
          {language === 'ta' ? 'அருகிலுள்ள நிவாரண முகாம்கள்' : 'Verified Relief Shelters'}
        </h1>
        <p className="text-xs text-slate-300 mt-1 max-w-xl">
          {language === 'ta'
            ? 'சென்னை மாநகராட்சியின் நிவாரண முகாம்கள், தற்போதைய இட வசதி மற்றும் உணவு வசதிகள்.'
            : 'Live capacity and amenities across official Greater Chennai Corporation relief centres.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {shelters.map((sh) => {
          const occupancyPct = Math.min(100, Math.round((sh.current_occupancy / sh.capacity) * 100));

          const statusColors: Record<string, string> = {
            AVAILABLE: 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40',
            LIMITED: 'bg-amber-950/70 text-amber-300 border-amber-500/40',
            FULL: 'bg-red-950/70 text-red-300 border-red-500/40',
            CLOSED: 'bg-slate-800 text-slate-400 border-slate-700'
          };

          return (
            <div
              key={sh.id}
              className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-slate-600 transition-all shadow-sm flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                    {sh.name}
                  </h3>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${statusColors[sh.status] || 'bg-slate-800'}`}>
                    {sh.status}
                  </span>
                </div>

                <p className="text-xs text-slate-300 flex items-center gap-1.5 mb-2.5">
                  <MapPin className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                  {sh.address}
                </p>

                {/* Capacity Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">
                      Occupancy: <strong className="text-white">{sh.current_occupancy}</strong> / {sh.capacity}
                    </span>
                    <span className="text-emerald-400 font-bold">{occupancyPct}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-700 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        occupancyPct >= 100
                          ? 'bg-red-500'
                          : occupancyPct >= 80
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${occupancyPct}%` }}
                    />
                  </div>
                </div>

                {/* Amenities Badges */}
                <div className="flex items-center gap-2 flex-wrap pt-2.5">
                  {sh.has_food && (
                    <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-[11px] text-amber-300 flex items-center gap-1">
                      <Utensils className="w-3 h-3" /> Food
                    </span>
                  )}
                  {sh.has_water && (
                    <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-[11px] text-sky-300 flex items-center gap-1">
                      <Droplet className="w-3 h-3" /> Water
                    </span>
                  )}
                  {sh.has_medical && (
                    <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-[11px] text-red-300 flex items-center gap-1">
                      <HeartPulse className="w-3 h-3" /> Medical
                    </span>
                  )}
                  {sh.has_accessibility && (
                    <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-[11px] text-emerald-300 flex items-center gap-1">
                      <Accessibility className="w-3 h-3" /> Accessible
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Actions: Contact & Coordinator Occupancy Adjuster */}
              <div className="pt-2 border-t border-slate-700 flex items-center justify-between gap-2">
                <a
                  href={`tel:${sh.contact_phone}`}
                  className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Call {sh.contact_person}</span>
                </a>

                {/* Coordinator update controls */}
                {(role === 'COMMUNITY_COORDINATOR' || role === 'ADMIN' || role === 'VOLUNTEER') && (
                  <div className="flex items-center gap-1">
                    <button
                      disabled={adjustingId === sh.id || sh.current_occupancy <= 0}
                      onClick={() => handleAdjustOccupancy(sh.id, -5)}
                      className="p-2 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-700 text-slate-300 active:scale-95 disabled:opacity-30"
                      title="Decrease occupancy by 5"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <button
                      disabled={adjustingId === sh.id || sh.current_occupancy >= sh.capacity}
                      onClick={() => handleAdjustOccupancy(sh.id, 5)}
                      className="p-2 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-700 text-slate-300 active:scale-95 disabled:opacity-30"
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
