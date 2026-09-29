import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.js';
import { useRealtime } from '../contexts/RealtimeContext.js';
import { api } from '../services/api.js';
import { Incident, SafetySummary } from '../types/index.js';
import {
  LifeBuoy,
  Waves,
  MapPin,
  ShieldCheck,
  Users,
  Package,
  Home,
  Mic,
  HeartHandshake,
  PhoneCall,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Flame,
  Clock,
  Radio,
  Gauge,
  Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RequestHelpModal } from '../components/modals/RequestHelpModal.js';
import { ReportFloodModal } from '../components/modals/ReportFloodModal.js';
import { SafetyCheckinModal } from '../components/modals/SafetyCheckinModal.js';
import { DonateModal } from '../components/modals/DonateModal.js';
import { HelplinesModal } from '../components/modals/HelplinesModal.js';
import { VoiceAssistantModal } from '../components/common/VoiceAssistantModal.js';
import { getLiveChennaiTelemetry, CommandTelemetry } from '../services/telemetry.js';

export const HomePage: React.FC = () => {
  const { currentArea, language, t } = useAuth();
  const { lastRealtimeEvent } = useRealtime();
  const navigate = useNavigate();

  // Modals
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showFloodModal, setShowFloodModal] = useState(false);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [showHelplineModal, setShowHelplineModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);

  // Live Telemetry from TN WRD & Kaggle dataset
  const [telemetry, setTelemetry] = useState<CommandTelemetry | null>(null);

  // Live Database Stats
  const [safetySummary, setSafetySummary] = useState<SafetySummary>({
    SAFE: 0,
    NEED_HELP: 0,
    EMERGENCY: 0,
    NO_RESPONSE: 0,
    TOTAL: 0
  });
  const [recentIncidents, setRecentIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHomeData = async () => {
    try {
      const [safetyData, incidentsData, telData] = await Promise.all([
        api.getSafetyStats(),
        api.getIncidents({ area: currentArea }),
        getLiveChennaiTelemetry()
      ]);
      setSafetySummary(safetyData.summary);
      setRecentIncidents(incidentsData.slice(0, 6));
      setTelemetry(telData);
    } catch (e) {
      console.warn('Error fetching homepage live data:', e);
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, [currentArea, lastRealtimeEvent]);

  return (
    <div className="pb-24 pt-3 px-3 sm:px-6 max-w-7xl mx-auto space-y-5">
      {/* High-Tech Tactical Command Center Banner (Matching Reference Image) */}
      <div className="relative overflow-hidden rounded-2xl hud-panel p-5 sm:p-7 border border-[#00ff9d]/30 shadow-[0_0_35px_rgba(0,0,0,0.7)]">
        {/* Subtle background radar circle */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full border border-[#00ff9d]/10 pointer-events-none" />
        <div className="absolute -right-10 -top-10 w-60 h-60 rounded-full border border-[#00e5ff]/10 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-2 font-mono">
              <span className="text-[11px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#00ff9d]/15 text-[#00ff9d] border border-[#00ff9d]/40 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00ff9d] animate-ping" />
                TACTICAL SECTOR: {currentArea.toUpperCase()}
              </span>
              <span className="text-xs text-[#00e5ff] font-bold">
                {language === 'ta' ? 'அதிவேக பேரிடர் கட்டளை மையம்' : 'HYPERLOCAL CRISIS COMMAND // 15 ZONES'}
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-sans">
              {language === 'ta' ? 'உடனடி உதவி மற்றும் பாதுகாப்பு கட்டுப்பாடு' : 'Disaster Relief & Tactical Operations'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed font-sans">
              {language === 'ta'
                ? 'வெள்ளப் பாதிப்பு, ஆம்புலன்ஸ், நிவாரண முகாம்கள் மற்றும் தன்னார்வலர் மீட்புப் பணிகளுக்கான நேரடி தளம்.'
                : 'Real-time telemetry, flood water levels, emergency rescue deployment, and safe camps across Chennai Corporation zones.'}
            </p>
          </div>

          {/* Tactical Voice Assistant Command Button */}
          <button
            onClick={() => setShowVoiceModal(true)}
            className="flex-shrink-0 flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl bg-[#00ff9d] hover:bg-[#5cffbe] text-slate-950 font-mono font-black text-xs shadow-[0_0_25px_rgba(0,255,157,0.45)] active:scale-95 transition-all touch-target border border-[#00ff9d]"
          >
            <Mic className="w-5 h-5 animate-pulse text-slate-950" />
            <span className="tracking-wider">{language === 'ta' ? 'குரல் கட்டளை (SPEAK)' : 'VOICE ASSISTANT HUD'}</span>
          </button>
        </div>

        {/* Real Hydro-Meteorological Telemetry Gauge Bar (TN WRD & Kaggle Dataset) */}
        {telemetry && (
          <div className="mt-5 pt-4 border-t border-[#00ff9d]/20 grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
            <div className="p-2.5 rounded-xl bg-[#060e17] border border-[#00ff9d]/25">
              <span className="text-[10px] text-slate-400 block mb-0.5">CHEMBARAMBAKKAM RESERVOIR</span>
              <span className="text-sm font-bold text-[#00ff9d]">
                {telemetry.reservoirs[0].current_level_ft} / {telemetry.reservoirs[0].full_level_ft} ft
              </span>
              <span className="text-[10px] text-[#ff2a55] block mt-0.5 font-bold">
                Outflow: {telemetry.reservoirs[0].outflow_cusecs.toLocaleString()} cusecs
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-[#060e17] border border-[#00e5ff]/25">
              <span className="text-[10px] text-slate-400 block mb-0.5">POONDI LAKE STORAGE</span>
              <span className="text-sm font-bold text-[#00e5ff]">
                {telemetry.reservoirs[1].current_storage_mcft} / {telemetry.reservoirs[1].capacity_mcft} Mcft
              </span>
              <span className="text-[10px] text-emerald-400 block mt-0.5 font-bold">
                Level: {telemetry.reservoirs[1].current_level_ft} ft
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-[#060e17] border border-[#ffb703]/25">
              <span className="text-[10px] text-slate-400 block mb-0.5">IMD MEENAMBAKKAM 24H RAIN</span>
              <span className="text-sm font-bold text-[#ffb703]">
                {telemetry.rainfall_stations[0].rainfall_24h_mm} mm
              </span>
              <span className="text-[10px] text-[#ffb703] block mt-0.5 font-bold">
                Status: {telemetry.rainfall_stations[0].intensity.replace('_', ' ')}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-[#060e17] border border-[#ff2a55]/25">
              <span className="text-[10px] text-slate-400 block mb-0.5">TAMBARAM / MUDICHUR GAUGE</span>
              <span className="text-sm font-bold text-[#ff2a55]">
                {telemetry.rainfall_stations[1].rainfall_24h_mm} mm
              </span>
              <span className="text-[10px] text-[#ff2a55] block mt-0.5 font-bold">
                IMD ALERT: RED WARNING
              </span>
            </div>
          </div>
        )}

        {/* Live SQL Aggregate Safety Ticker */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 font-bold text-[#00ff9d] uppercase tracking-wider text-[11px]">
            <ShieldCheck className="w-4 h-4 text-[#00ff9d]" />
            <span>{language === 'ta' ? 'சமூக பாதுகாப்பு நிலவரம்:' : 'ZONE SAFETY STATUS TELEMETRY:'}</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap font-bold">
            <span className="px-2.5 py-1 rounded-lg bg-[#00ff9d]/15 text-[#00ff9d] border border-[#00ff9d]/40 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00ff9d]"></span> {safetySummary.SAFE} {language === 'ta' ? 'பாதுகாப்பு' : 'SAFE'}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[#ffb703]/15 text-[#ffb703] border border-[#ffb703]/40 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#ffb703]"></span> {safetySummary.NEED_HELP} {language === 'ta' ? 'உதவி தேவை' : 'NEED HELP'}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[#ff2a55]/15 text-[#ff2a55] border border-[#ff2a55]/40 flex items-center gap-1.5 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-[#ff2a55]"></span> {safetySummary.EMERGENCY} {language === 'ta' ? 'அவசரம்' : 'CRITICAL'}
            </span>
          </div>
        </div>
      </div>

      {/* Main 2 Hero Action Cards (Cyberpunk High-Priority Command Controls) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* REQUEST RESCUE & MEDICAL HELP */}
        <button
          onClick={() => setShowHelpModal(true)}
          className="relative group overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-[#1a080d] via-[#120508] to-[#250a12] border border-[#ff2a55]/50 hover:border-[#ff2a55] text-white shadow-[0_0_30px_rgba(255,42,85,0.2)] flex items-center justify-between transition-all duration-200 active:scale-98 touch-target"
        >
          <div className="flex items-center gap-4 text-left">
            <div className="w-14 h-14 rounded-xl bg-[#ff2a55]/20 border border-[#ff2a55]/60 flex items-center justify-center text-3xl shadow-[0_0_15px_rgba(255,42,85,0.4)] flex-shrink-0">
              🆘
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black tracking-tight leading-none mb-1 font-mono glow-text-red">
                {t.requestHelp}
              </div>
              <p className="text-xs text-rose-200/90 font-sans">
                {language === 'ta'
                  ? 'மருத்துவம், ஆம்புலன்ஸ், உணவு, படகு மீட்பு'
                  : 'Medical Escort, Inflatable Boat, Emergency Ration'}
              </p>
            </div>
          </div>
          <ArrowRight className="w-6 h-6 text-[#ff2a55] group-hover:translate-x-1.5 transition-transform" />
        </button>

        {/* REPORT FLOOD / CRISIS */}
        <button
          onClick={() => setShowFloodModal(true)}
          className="relative group overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-[#06141c] via-[#050f16] to-[#0a202c] border border-[#00e5ff]/50 hover:border-[#00e5ff] text-white shadow-[0_0_30px_rgba(0,229,255,0.2)] flex items-center justify-between transition-all duration-200 active:scale-98 touch-target"
        >
          <div className="flex items-center gap-4 text-left">
            <div className="w-14 h-14 rounded-xl bg-[#00e5ff]/20 border border-[#00e5ff]/60 flex items-center justify-center text-3xl shadow-[0_0_15px_rgba(0,229,255,0.4)] flex-shrink-0">
              🌊
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black tracking-tight leading-none mb-1 font-mono glow-text-cyan">
                {t.reportFlood}
              </div>
              <p className="text-xs text-cyan-200/90 font-sans">
                {language === 'ta'
                  ? 'நீர்மட்டம், தெரு நிலை, AI மதிப்பீடு'
                  : 'Water Level Stagnation, Street Block, AI Vision Estimate'}
              </p>
            </div>
          </div>
          <ArrowRight className="w-6 h-6 text-[#00e5ff] group-hover:translate-x-1.5 transition-transform" />
        </button>
      </div>

      {/* Grid of Tactical Command Services */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1 font-mono">
          <h2 className="text-xs font-bold text-[#00ff9d] uppercase tracking-widest flex items-center gap-2">
            <Activity className="w-3.5 h-3.5" />
            {language === 'ta' ? 'அதிவேக அவசரச் செயல்பாடுகள்' : 'TACTICAL COMMAND MATRIX // 8 SERVICES'}
          </h2>
          <span className="text-[10px] text-slate-500">REALTIME DISPATCH</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* I AM SAFE */}
          <button
            onClick={() => setShowSafetyModal(true)}
            className="flex flex-col items-center justify-center p-4 rounded-xl hud-panel border border-[#00ff9d]/35 hover:border-[#00ff9d] text-[#00ff9d] transition-all active:scale-95 touch-target shadow-lg group"
          >
            <span className="text-2xl mb-1.5 group-hover:scale-110 transition-transform">🟢</span>
            <span className="font-bold font-mono text-sm text-white">{t.iAmSafe}</span>
            <span className="text-[10px] text-slate-400 mt-0.5">
              {language === 'ta' ? 'பாதுகாப்பு பதிவு' : 'Check-in Safe'}
            </span>
          </button>

          {/* INCIDENT MAP */}
          <button
            onClick={() => navigate('/map')}
            className="flex flex-col items-center justify-center p-4 rounded-xl hud-panel border border-[#00e5ff]/35 hover:border-[#00e5ff] text-[#00e5ff] transition-all active:scale-95 touch-target shadow-lg group"
          >
            <span className="text-2xl mb-1.5 group-hover:scale-110 transition-transform">📍</span>
            <span className="font-bold font-mono text-sm text-white">{t.incidentMap}</span>
            <span className="text-[10px] text-slate-400 mt-0.5">
              {language === 'ta' ? 'நேரடி வரைபடம்' : 'Live Tactical Map'}
            </span>
          </button>

          {/* VOLUNTEER */}
          <button
            onClick={() => navigate('/volunteer')}
            className="flex flex-col items-center justify-center p-4 rounded-xl hud-panel border border-[#00ff9d]/35 hover:border-[#00ff9d] text-[#00ff9d] transition-all active:scale-95 touch-target shadow-lg group"
          >
            <span className="text-2xl mb-1.5 group-hover:scale-110 transition-transform">🙋</span>
            <span className="font-bold font-mono text-sm text-white">{t.volunteer}</span>
            <span className="text-[10px] text-slate-400 mt-0.5">
              {language === 'ta' ? 'மீட்புப் பணி' : 'Rescue Squad'}
            </span>
          </button>

          {/* SHELTERS */}
          <button
            onClick={() => navigate('/shelters')}
            className="flex flex-col items-center justify-center p-4 rounded-xl hud-panel border border-[#00ff9d]/35 hover:border-[#00ff9d] text-[#00ff9d] transition-all active:scale-95 touch-target shadow-lg group"
          >
            <span className="text-2xl mb-1.5 group-hover:scale-110 transition-transform">🏠</span>
            <span className="font-bold font-mono text-sm text-white">{t.shelters}</span>
            <span className="text-[10px] text-slate-400 mt-0.5">
              {language === 'ta' ? 'நிவாரண முகாம்கள்' : 'GCC Safe Camps'}
            </span>
          </button>

          {/* RESOURCES */}
          <button
            onClick={() => navigate('/resources')}
            className="flex flex-col items-center justify-center p-4 rounded-xl hud-panel border border-[#ffb703]/35 hover:border-[#ffb703] text-[#ffb703] transition-all active:scale-95 touch-target shadow-lg group"
          >
            <span className="text-2xl mb-1.5 group-hover:scale-110 transition-transform">📦</span>
            <span className="font-bold font-mono text-sm text-white">{t.resources}</span>
            <span className="text-[10px] text-slate-400 mt-0.5">
              {language === 'ta' ? 'உணவு, குடிநீர், படகுகள்' : 'Boats & Rations'}
            </span>
          </button>

          {/* COMMUNITY */}
          <button
            onClick={() => navigate('/community')}
            className="flex flex-col items-center justify-center p-4 rounded-xl hud-panel border border-[#00e5ff]/35 hover:border-[#00e5ff] text-[#00e5ff] transition-all active:scale-95 touch-target shadow-lg group"
          >
            <span className="text-2xl mb-1.5 group-hover:scale-110 transition-transform">👥</span>
            <span className="font-bold font-mono text-sm text-white">{t.community}</span>
            <span className="text-[10px] text-slate-400 mt-0.5">
              {language === 'ta' ? 'உள்ளூர் நேரலை பதிவுகள்' : 'Ward Intel Feed'}
            </span>
          </button>

          {/* RELIEF FUND */}
          <button
            onClick={() => setShowDonateModal(true)}
            className="flex flex-col items-center justify-center p-4 rounded-xl hud-panel border border-[#00ff9d]/35 hover:border-[#00ff9d] text-[#00ff9d] transition-all active:scale-95 touch-target shadow-lg group"
          >
            <span className="text-2xl mb-1.5 group-hover:scale-110 transition-transform">💰</span>
            <span className="font-bold font-mono text-sm text-white">{t.reliefFund}</span>
            <span className="text-[10px] text-slate-400 mt-0.5">
              {language === 'ta' ? 'நிவாரண நிதி' : 'Disaster Relief Fund'}
            </span>
          </button>

          {/* HELPLINES */}
          <button
            onClick={() => setShowHelplineModal(true)}
            className="flex flex-col items-center justify-center p-4 rounded-xl hud-panel border border-[#ff2a55]/40 hover:border-[#ff2a55] text-[#ff2a55] transition-all active:scale-95 touch-target shadow-lg group"
          >
            <span className="text-2xl mb-1.5 group-hover:scale-110 transition-transform">📞</span>
            <span className="font-bold font-mono text-sm text-white">{t.helplines}</span>
            <span className="text-[10px] text-slate-400 mt-0.5">
              1913, 1070, 108, 112
            </span>
          </button>
        </div>
      </div>

      {/* Live Sector Inundation & Crisis Incident Stream (Real GCC & Kaggle Records) */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-3 px-1 font-mono">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#00ff9d]" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              {language === 'ta' ? 'அண்மைப் பேரிடர் அறிக்கைகள் (GCC தரவு)' : 'TACTICAL INCIDENT LOG // GCC ZONE ALERTS'}
            </h2>
          </div>
          <button
            onClick={() => navigate('/map')}
            className="text-xs text-[#00ff9d] hover:text-[#5cffbe] font-bold flex items-center gap-1.5"
          >
            <span>{language === 'ta' ? 'வரைபடத்தில் பார்க்க' : 'EXPAND TACTICAL MAP'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2.5">
          {recentIncidents.length === 0 ? (
            <div className="p-8 rounded-xl hud-panel text-center text-xs text-slate-400 font-mono">
              Sector telemetry stable. No critical flood reports in {currentArea}.
            </div>
          ) : (
            recentIncidents.map((inc) => (
              <div
                key={inc.id}
                onClick={() => navigate('/map')}
                className="p-3.5 rounded-xl hud-panel hover:border-[#00ff9d]/50 transition-all flex items-start justify-between gap-3 cursor-pointer shadow-sm group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#060e17] border border-[#00ff9d]/30 flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-105 transition-transform">
                    {inc.type === 'FLOOD' && '🌊'}
                    {inc.type === 'FIRE' && '🔥'}
                    {inc.type === 'MEDICAL' && '🏥'}
                    {inc.type === 'ROAD_BLOCK' && '🚧'}
                    {inc.type === 'POWER_ISSUE' && '⚡'}
                    {inc.type === 'CYCLONE' && '🌪️'}
                    {inc.type === 'BUILDING_DAMAGE' && '🏚️'}
                    {inc.type === 'MISSING_PERSON' && '👤'}
                    {inc.type === 'EMERGENCY' && '🆘'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-xs font-bold text-white">{inc.type}</span>
                      <span
                        className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${
                          inc.severity === 'CRITICAL'
                            ? 'bg-[#ff2a55]/20 text-[#ff2a55] border-[#ff2a55]/50'
                            : inc.severity === 'HIGH'
                            ? 'bg-[#ffb703]/20 text-[#ffb703] border-[#ffb703]/50'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {inc.severity}
                      </span>
                      <span className="text-[10px] text-[#00e5ff]">📍 {inc.area}</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 font-sans leading-snug line-clamp-2">
                      {inc.description}
                    </p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 font-mono">
                  <span className="text-[10px] text-slate-400 block">
                    {new Date(inc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-[9px] font-bold uppercase text-[#00ff9d] mt-1 block">
                    {inc.verification_status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modals rendered on trigger */}
      <RequestHelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        onSuccess={fetchHomeData}
      />
      <ReportFloodModal
        isOpen={showFloodModal}
        onClose={() => setShowFloodModal(false)}
        onSuccess={fetchHomeData}
      />
      <SafetyCheckinModal
        isOpen={showSafetyModal}
        onClose={() => setShowSafetyModal(false)}
        onSuccess={fetchHomeData}
      />
      <DonateModal
        isOpen={showDonateModal}
        onClose={() => setShowDonateModal(false)}
      />
      <HelplinesModal
        isOpen={showHelplineModal}
        onClose={() => setShowHelplineModal(false)}
      />
      <VoiceAssistantModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onTriggerHelp={() => setShowHelpModal(true)}
        onTriggerFlood={() => setShowFloodModal(true)}
      />
    </div>
  );
};
