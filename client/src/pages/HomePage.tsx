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
  PhoneCall,
  AlertTriangle,
  ArrowRight,
  Clock,
  Compass,
  HeartHandshake
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { IncidentMap } from '../components/map/IncidentMap.js';
import { RequestHelpModal } from '../components/modals/RequestHelpModal.js';
import { ReportFloodModal } from '../components/modals/ReportFloodModal.js';
import { SafetyCheckinModal } from '../components/modals/SafetyCheckinModal.js';
import { DonateModal } from '../components/modals/DonateModal.js';
import { HelplinesModal } from '../components/modals/HelplinesModal.js';
import { VoiceAssistantModal } from '../components/common/VoiceAssistantModal.js';
import { ReportIncidentModal } from '../components/modals/ReportIncidentModal.js';
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
  const [showIncidentModal, setShowIncidentModal] = useState(false);

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

  const fetchHomeData = async () => {
    try {
      const [safetyData, incidentsData, telData] = await Promise.all([
        api.getSafetyStats(),
        api.getIncidents({ area: currentArea }),
        getLiveChennaiTelemetry()
      ]);
      setSafetySummary(safetyData.summary);
      setRecentIncidents(incidentsData.slice(0, 5));
      setTelemetry(telData);
    } catch (e) {
      console.warn('Error fetching homepage live data:', e);
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, [currentArea, lastRealtimeEvent]);

  return (
    <div className="pb-24 pt-3 px-3 sm:px-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      
      {/* 1. Natural Welcome & Alert Banner */}
      <div className="rounded-2xl p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-600/40">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                {currentArea}
              </span>
              <span className="text-xs text-sky-400 font-medium">
                {language === 'ta' ? 'சென்னை பேரிடர் மையம்' : 'Chennai Disaster Support'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {language === 'ta'
                ? 'அவசர உதவி மற்றும் பாதுகாப்பு தளம்'
                : 'Emergency Response & Disaster Relief'}
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              {language === 'ta'
                ? 'நேரலை வரைபடம், அவசர உதவி, நிவாரண முகாம்கள் மற்றும் ஏரி நீர்மட்டம்.'
                : 'Live map, emergency assistance, relief shelters, and lake water levels.'}
            </p>
          </div>

          {/* Voice Assistant Pill Button */}
          <button
            onClick={() => setShowVoiceModal(true)}
            className="self-start md:self-center flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all"
            aria-label="Voice Assistant"
          >
            <Mic className="w-4 h-4" />
            <span>{language === 'ta' ? 'குரல் வழி உதவி' : 'Voice Assistant'}</span>
          </button>
        </div>

        {/* Real Reservoir & Rainfall Quick Bar */}
        {telemetry && (
          <div className="mt-4 pt-3 border-t border-slate-700/70 grid grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60">
              <span className="text-[11px] text-slate-400 block">{language === 'ta' ? 'செம்பரம்பாக்கம் ஏரி' : 'Chembarambakkam Lake'}</span>
              <span className="text-sm font-bold text-emerald-400">
                {telemetry.reservoirs?.[0]?.current_level_ft ?? '22.8'} / {telemetry.reservoirs?.[0]?.full_level_ft ?? '24.0'} ft
              </span>
              <span className="text-[10px] text-slate-300 block">
                {language === 'ta' ? 'வெளியேற்றம்' : 'Outflow'}: {(telemetry.reservoirs?.[0]?.outflow_cusecs ?? 2400).toLocaleString()} cusecs
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60">
              <span className="text-[11px] text-slate-400 block">{language === 'ta' ? 'பூண்டி நீர்த்தேக்கம்' : 'Poondi Reservoir'}</span>
              <span className="text-sm font-bold text-sky-400">
                {telemetry.reservoirs?.[1]?.current_storage_mcft ?? '2,750'} / {telemetry.reservoirs?.[1]?.capacity_mcft ?? '3,231'} Mcft
              </span>
              <span className="text-[10px] text-slate-300 block">
                {language === 'ta' ? 'நீர்மட்டம்' : 'Level'}: {telemetry.reservoirs?.[1]?.current_level_ft ?? '33.4'} ft
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60">
              <span className="text-[11px] text-slate-400 block">{language === 'ta' ? 'மீனம்பாக்கம் மழை' : 'Meenambakkam Rain'}</span>
              <span className="text-sm font-bold text-amber-400">
                {telemetry.rainfall_stations?.[0]?.rainfall_24h_mm ?? '48'} mm
              </span>
              <span className="text-[10px] text-slate-300 block">
                {telemetry.rainfall_stations?.[0]?.intensity?.replace?.('_', ' ') ?? 'Moderate Rain'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60">
              <span className="text-[11px] text-slate-400 block">{language === 'ta' ? 'தாம்பரம் / முடிச்சூர்' : 'Tambaram / Mudichur'}</span>
              <span className="text-sm font-bold text-red-400">
                {telemetry.rainfall_stations?.[1]?.rainfall_24h_mm ?? '65'} mm
              </span>
              <span className="text-[10px] text-red-300 block">
                {language === 'ta' ? 'கனமழை எச்சரிக்கை' : 'Heavy Rain Warning'}
              </span>
            </div>
          </div>
        )}

        {/* Citizen Safety Counts Bar */}
        <div className="mt-3 pt-3 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{language === 'ta' ? 'மக்களின் பாதுகாப்பு நிலை:' : 'Citizen Safety Status:'}</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap font-medium">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/70 text-emerald-300 border border-emerald-600/40 text-xs">
              🟢 {safetySummary.SAFE} {language === 'ta' ? 'பாதுகாப்பு' : 'Safe'}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-950/70 text-amber-300 border border-amber-600/40 text-xs">
              🟡 {safetySummary.NEED_HELP} {language === 'ta' ? 'உதவி தேவை' : 'Need Help'}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-red-950/70 text-red-300 border border-red-600/40 text-xs">
              🔴 {safetySummary.EMERGENCY} {language === 'ta' ? 'அவசரம்' : 'Critical'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Primary 2 Emergency Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* REQUEST RESCUE / SOS */}
        <button
          onClick={() => setShowHelpModal(true)}
          className="group p-5 rounded-2xl bg-gradient-to-br from-red-950/90 via-red-900/60 to-slate-900 border border-red-600/60 hover:border-red-500 text-white shadow-lg flex items-center justify-between transition-all active:scale-98"
        >
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-xl bg-red-600/30 border border-red-400/50 flex items-center justify-center text-2xl flex-shrink-0">
              🆘
            </div>
            <div>
              <div className="text-xl font-bold tracking-tight text-white mb-0.5">
                {t.requestHelp}
              </div>
              <p className="text-xs text-red-200">
                {language === 'ta'
                  ? 'மருத்துவம், உணவு, படகு மீட்பு மற்றும் அவசர உதவி'
                  : 'Medical emergency, rescue boats, food rations'}
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-red-400 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* REPORT FLOOD */}
        <button
          onClick={() => setShowFloodModal(true)}
          className="group p-5 rounded-2xl bg-gradient-to-br from-sky-950/90 via-sky-900/60 to-slate-900 border border-sky-600/60 hover:border-sky-500 text-white shadow-lg flex items-center justify-between transition-all active:scale-98"
        >
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-xl bg-sky-600/30 border border-sky-400/50 flex items-center justify-center text-2xl flex-shrink-0">
              🌊
            </div>
            <div>
              <div className="text-xl font-bold tracking-tight text-white mb-0.5">
                {t.reportFlood}
              </div>
              <p className="text-xs text-sky-200">
                {language === 'ta'
                  ? 'தெருவில் நீர் தேக்கம், சாலை அடைப்பு தகவல்'
                  : 'Water level stagnation, flooded streets'}
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-sky-400 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* 3. PROMINENT EMBEDDED MAP FEATURE (RIGHT ON HOME PAGE) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-400" />
              <span>{language === 'ta' ? 'நேரலை பேரிடர் வரைபடம்' : 'Live Disaster Map'}</span>
            </h2>
            <p className="text-xs text-slate-300">
              {language === 'ta'
                ? 'பாதுகாப்பு முகாம்கள், நிவாரண பாதைகள் மற்றும் வெள்ளப் பகுதிகள்.'
                : 'Safe shelters, evacuation routes, and active flood zones.'}
            </p>
          </div>

          <button
            onClick={() => navigate('/map')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700"
          >
            <span>{language === 'ta' ? 'பெரிதாக்கு' : 'Full Map'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* The Live Interactive IncidentMap */}
        <IncidentMap height="460px" />
      </div>

      {/* 4. Quick Services Grid (8 accessible cards) */}
      <div>
        <h2 className="text-sm font-bold text-slate-300 mb-3 px-1">
          {language === 'ta' ? 'விரைவு சேவைகள்' : 'Quick Actions'}
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* I AM SAFE */}
          <button
            onClick={() => setShowSafetyModal(true)}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-all text-center group shadow-sm active:scale-95"
          >
            <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">🟢</span>
            <span className="font-bold text-xs text-white">{t.iAmSafe}</span>
            <span className="text-[10px] text-slate-400 mt-0.5">
              {language === 'ta' ? 'பாதுகாப்பு பதிவு' : 'Check-in Safe'}
            </span>
          </button>

          {/* SHELTERS */}
          <button
            onClick={() => navigate('/shelters')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-all text-center group shadow-sm active:scale-95"
          >
            <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">🏠</span>
            <span className="font-bold text-xs text-white">{t.shelters}</span>
            <span className="text-[10px] text-slate-400 mt-0.5">
              {language === 'ta' ? 'நிவாரண முகாம்கள்' : 'Safe Shelters'}
            </span>
          </button>

          {/* RESOURCES */}
          <button
            onClick={() => navigate('/resources')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-all text-center group shadow-sm active:scale-95"
          >
            <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">📦</span>
            <span className="font-bold text-xs text-white">{t.resources}</span>
            <span className="text-[10px] text-slate-400 mt-0.5">
              {language === 'ta' ? 'உணவு, குடிநீர்' : 'Food & Boats'}
            </span>
          </button>

          {/* VOLUNTEER */}
          <button
            onClick={() => navigate('/volunteer')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-all text-center group shadow-sm active:scale-95"
          >
            <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">🙋</span>
            <span className="font-bold text-xs text-white">{t.volunteer}</span>
            <span className="text-[10px] text-slate-400 mt-0.5">
              {language === 'ta' ? 'தன்னார்வலர்' : 'Volunteer'}
            </span>
          </button>

          {/* COMMUNITY */}
          <button
            onClick={() => navigate('/community')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-all text-center group shadow-sm active:scale-95"
          >
            <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">👥</span>
            <span className="font-bold text-xs text-white">{t.community}</span>
            <span className="text-[10px] text-slate-400 mt-0.5">
              {language === 'ta' ? 'உள்ளூர் தகவல்கள்' : 'Local Updates'}
            </span>
          </button>

          {/* REPORT OTHER INCIDENT */}
          <button
            onClick={() => setShowIncidentModal(true)}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-all text-center group shadow-sm active:scale-95"
          >
            <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">⚠️</span>
            <span className="font-bold text-xs text-white">{language === 'ta' ? 'விபத்து பதிவு' : 'Report Incident'}</span>
            <span className="text-[10px] text-slate-400 mt-0.5">
              {language === 'ta' ? 'தீ, மரம் விழுந்தது' : 'Road block, fire'}
            </span>
          </button>

          {/* RELIEF FUND */}
          <button
            onClick={() => setShowDonateModal(true)}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-all text-center group shadow-sm active:scale-95"
          >
            <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">💰</span>
            <span className="font-bold text-xs text-white">{t.reliefFund}</span>
            <span className="text-[10px] text-slate-400 mt-0.5">
              {language === 'ta' ? 'நிதி உதவி' : 'Donate Fund'}
            </span>
          </button>

          {/* HELPLINES */}
          <button
            onClick={() => setShowHelplineModal(true)}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-red-500/40 text-red-300 transition-all text-center group shadow-sm active:scale-95"
          >
            <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">📞</span>
            <span className="font-bold text-xs text-white">{t.helplines}</span>
            <span className="text-[10px] text-slate-400 mt-0.5">
              1913 • 1070 • 108
            </span>
          </button>
        </div>
      </div>

      {/* 5. Recent Verified Incident Reports */}
      <div className="pt-1">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">
              {language === 'ta' ? 'அண்மை நிலவரங்கள்' : 'Recent Incident Reports'}
            </h2>
          </div>
          <button
            onClick={() => navigate('/map')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
          >
            {language === 'ta' ? 'அனைத்தும் பார்க்க' : 'View all'}
          </button>
        </div>

        <div className="space-y-2">
          {recentIncidents.length === 0 ? (
            <div className="p-6 rounded-xl bg-slate-800/60 border border-slate-700/60 text-center text-xs text-slate-400">
              {language === 'ta'
                ? 'தற்போது அவசர புகார்கள் ஏதுமில்லை.'
                : `No active emergencies reported in ${currentArea}.`}
            </div>
          ) : (
            recentIncidents.map((inc) => (
              <div
                key={inc.id}
                onClick={() => navigate('/map')}
                className="p-3 rounded-xl bg-slate-800/70 hover:bg-slate-700/70 border border-slate-700/60 transition-all flex items-start justify-between gap-3 cursor-pointer shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-lg flex-shrink-0">
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
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{inc.type}</span>
                      <span
                        className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          inc.severity === 'CRITICAL'
                            ? 'bg-red-900/60 text-red-200'
                            : inc.severity === 'HIGH'
                            ? 'bg-amber-900/60 text-amber-200'
                            : 'bg-slate-700 text-slate-200'
                        }`}
                      >
                        {inc.severity}
                      </span>
                      <span className="text-xs text-slate-400">📍 {inc.area}</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-snug line-clamp-1">
                      {inc.description}
                    </p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 text-xs text-slate-400">
                  {new Date(inc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modals */}
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
      <ReportIncidentModal
        isOpen={showIncidentModal}
        onClose={() => setShowIncidentModal(false)}
        onSuccess={fetchHomeData}
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
