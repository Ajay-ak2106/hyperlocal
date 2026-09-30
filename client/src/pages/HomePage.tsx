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
  HeartHandshake,
  AlertOctagon
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
  const { currentArea, language, t, gpsActive, coords, requestGps } = useAuth();
  const { lastRealtimeEvent } = useRealtime();
  const navigate = useNavigate();

  // Modals
  const [showHelpModal, setShowHelpModal] = useState(false);
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
    <div className="pb-24 pt-3 px-3 sm:px-6 max-w-7xl mx-auto space-y-6 text-slate-800">
      
      {/* 1. Natural Welcome & Alert Banner */}
      <div className="rounded-3xl p-5 sm:p-6 bg-white/70 backdrop-blur-xl border border-white/50 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                <span className={`w-2 h-2 rounded-full ${gpsActive ? 'bg-emerald-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                <span>{currentArea}</span>
              </span>
              <span className="text-xs text-sky-600 font-bold bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
                {language === 'ta' ? 'சென்னை பேரிடர் மையம்' : 'Chennai Disaster Support'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
              {language === 'ta'
                ? 'அவசர உதவி மற்றும் பாதுகாப்பு தளம்'
                : 'Emergency Response & Relief'}
            </h1>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl font-medium">
              {language === 'ta'
                ? 'நேரலை வரைபடம், அவசர உதவி, நிவாரண முகாம்கள் மற்றும் ஏரி நீர்மட்டம்.'
                : 'Live map, emergency assistance, relief shelters, and lake water levels.'}
            </p>
          </div>

          {/* Voice Assistant Pill Button */}
          <button
            onClick={() => setShowVoiceModal(true)}
            className="self-start md:self-center flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/30 active:scale-95 transition-all border border-emerald-400"
            aria-label="Voice Assistant"
          >
            <Mic className="w-4 h-4" />
            <span>{language === 'ta' ? 'குரல் வழி உதவி' : 'Voice Assistant'}</span>
          </button>
        </div>

        {/* Real Reservoir & Rainfall Quick Bar */}
        {telemetry && (
          <div className="mt-5 pt-4 border-t border-slate-200 grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-white/60 border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">{language === 'ta' ? 'செம்பரம்பாக்கம் ஏரி' : 'Chembarambakkam'}</span>
              <span className="text-lg font-extrabold text-emerald-600 mt-1 block">
                {telemetry.reservoirs?.[0]?.current_level_ft ?? '22.8'} / {telemetry.reservoirs?.[0]?.full_level_ft ?? '24.0'} ft
              </span>
              <span className="text-[11px] text-slate-600 font-medium block mt-1">
                {language === 'ta' ? 'வெளியேற்றம்' : 'Outflow'}: {(telemetry.reservoirs?.[0]?.outflow_cusecs ?? 2400).toLocaleString()} cusecs
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-white/60 border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">{language === 'ta' ? 'பூண்டி நீர்த்தேக்கம்' : 'Poondi Reservoir'}</span>
              <span className="text-lg font-extrabold text-sky-600 mt-1 block">
                {telemetry.reservoirs?.[1]?.current_storage_mcft ?? '2,750'} / {telemetry.reservoirs?.[1]?.capacity_mcft ?? '3,231'}
              </span>
              <span className="text-[11px] text-slate-600 font-medium block mt-1">
                {language === 'ta' ? 'நீர்மட்டம்' : 'Level'}: {telemetry.reservoirs?.[1]?.current_level_ft ?? '33.4'} ft
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-white/60 border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">{language === 'ta' ? 'மீனம்பாக்கம் மழை' : 'Meenambakkam'}</span>
              <span className="text-lg font-extrabold text-amber-600 mt-1 block">
                {telemetry.rainfall_stations?.[0]?.rainfall_24h_mm ?? '48'} mm
              </span>
              <span className="text-[11px] text-slate-600 font-medium block mt-1">
                {telemetry.rainfall_stations?.[0]?.intensity?.replace?.('_', ' ') ?? 'Moderate Rain'}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-red-50 border border-red-100 shadow-sm">
              <span className="text-[11px] font-bold text-red-500 block uppercase tracking-wider">{language === 'ta' ? 'தாம்பரம் / முடிச்சூர்' : 'Tambaram / Mudichur'}</span>
              <span className="text-lg font-extrabold text-red-600 mt-1 block">
                {telemetry.rainfall_stations?.[1]?.rainfall_24h_mm ?? '65'} mm
              </span>
              <span className="text-[11px] text-red-600 font-bold block mt-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {language === 'ta' ? 'கனமழை எச்சரிக்கை' : 'Heavy Rain Warning'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Primary 2 Emergency Action Buttons (Updated to Report Incident) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* REQUEST RESCUE / SOS */}
        <button
          onClick={() => setShowHelpModal(true)}
          className="group p-5 rounded-3xl bg-red-500 hover:bg-red-600 border-4 border-white text-white shadow-xl flex items-center justify-between transition-all active:scale-95"
        >
          <div className="flex items-center gap-4 text-left">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
              <LifeBuoy className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="text-2xl font-extrabold tracking-tight text-white mb-0.5">
                {t.requestHelp}
              </div>
              <p className="text-sm text-red-100 font-medium">
                {language === 'ta'
                  ? 'மருத்துவம், உணவு மற்றும் அவசர உதவி'
                  : 'Medical emergency, rescue boats, SOS'}
              </p>
            </div>
          </div>
          <ArrowRight className="w-6 h-6 text-white group-hover:translate-x-2 transition-transform" />
        </button>

        {/* REPORT INCIDENT */}
        <button
          onClick={() => setShowIncidentModal(true)}
          className="group p-5 rounded-3xl bg-amber-500 hover:bg-amber-600 border-4 border-white text-white shadow-xl flex items-center justify-between transition-all active:scale-95"
        >
          <div className="flex items-center gap-4 text-left">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
              <AlertOctagon className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="text-2xl font-extrabold tracking-tight text-white mb-0.5">
                {language === 'ta' ? 'விபத்து பதிவு' : 'Report Incident'}
              </div>
              <p className="text-sm text-amber-100 font-medium">
                {language === 'ta'
                  ? 'வெள்ளம், தீ, மரம் விழுந்தது'
                  : 'Flood, road block, fire, tree fall'}
              </p>
            </div>
          </div>
          <ArrowRight className="w-6 h-6 text-white group-hover:translate-x-2 transition-transform" />
        </button>
      </div>

      {/* 3. PROMINENT EMBEDDED MAP FEATURE */}
      <div className="space-y-3 bg-white/70 backdrop-blur-xl rounded-3xl p-4 border border-white/50 shadow-lg">
        <div className="flex items-center justify-between px-2">
          <div>
            <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-500" />
              <span>{language === 'ta' ? 'நேரலை பேரிடர் வரைபடம்' : 'Live Disaster Map'}</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {language === 'ta'
                ? 'பாதுகாப்பு முகாம்கள், நிவாரண பாதைகள் மற்றும் வெள்ளப் பகுதிகள்.'
                : 'Safe shelters, evacuation routes, and active incident zones.'}
            </p>
          </div>

          <button
            onClick={() => navigate('/map')}
            className="text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl transition-colors shadow-md flex items-center gap-1.5"
          >
            <span>{language === 'ta' ? 'பெரிதாக்கு' : 'Full Map'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* The Live Interactive IncidentMap */}
        <div className="rounded-2xl overflow-hidden border border-slate-200">
          <IncidentMap height="460px" />
        </div>
      </div>

      {/* 4. Quick Services Grid */}
      <div>
        <h2 className="text-sm font-extrabold text-slate-700 mb-3 px-2 uppercase tracking-wider">
          {language === 'ta' ? 'விரைவு சேவைகள்' : 'Quick Actions'}
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* I AM SAFE */}
          <button
            onClick={() => setShowSafetyModal(true)}
            className="flex flex-col items-center justify-center p-4 rounded-3xl bg-white border border-slate-200 hover:border-emerald-300 transition-all text-center group shadow-md hover:shadow-lg active:scale-95"
          >
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6 text-emerald-500" />
            </div>
            <span className="font-bold text-sm text-slate-800">{t.iAmSafe}</span>
          </button>

          {/* SHELTERS */}
          <button
            onClick={() => navigate('/shelters')}
            className="flex flex-col items-center justify-center p-4 rounded-3xl bg-white border border-slate-200 hover:border-emerald-300 transition-all text-center group shadow-md hover:shadow-lg active:scale-95"
          >
            <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Home className="w-6 h-6 text-sky-500" />
            </div>
            <span className="font-bold text-sm text-slate-800">{t.shelters}</span>
          </button>

          {/* RESOURCES */}
          <button
            onClick={() => navigate('/resources')}
            className="flex flex-col items-center justify-center p-4 rounded-3xl bg-white border border-slate-200 hover:border-emerald-300 transition-all text-center group shadow-md hover:shadow-lg active:scale-95"
          >
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Package className="w-6 h-6 text-indigo-500" />
            </div>
            <span className="font-bold text-sm text-slate-800">{t.resources}</span>
          </button>

          {/* VOLUNTEER */}
          <button
            onClick={() => navigate('/volunteer')}
            className="flex flex-col items-center justify-center p-4 rounded-3xl bg-white border border-slate-200 hover:border-emerald-300 transition-all text-center group shadow-md hover:shadow-lg active:scale-95"
          >
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <HeartHandshake className="w-6 h-6 text-amber-500" />
            </div>
            <span className="font-bold text-sm text-slate-800">{t.volunteer}</span>
          </button>
        </div>
      </div>

      {/* 5. Recent Verified Incident Reports */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-5 border border-white/50 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Clock className="w-4 h-4 text-emerald-600" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-800">
              {language === 'ta' ? 'அண்மை நிலவரங்கள்' : 'Recent Reports'}
            </h2>
          </div>
          <button
            onClick={() => navigate('/map')}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg"
          >
            {language === 'ta' ? 'அனைத்தும் பார்க்க' : 'View all'}
          </button>
        </div>

        <div className="space-y-3">
          {recentIncidents.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white border border-slate-100 text-center text-sm font-medium text-slate-500 shadow-sm">
              {language === 'ta'
                ? 'தற்போது அவசர புகார்கள் ஏதுமில்லை.'
                : `No active emergencies reported in ${currentArea}.`}
            </div>
          ) : (
            recentIncidents.map((inc) => (
              <div
                key={inc.id}
                onClick={() => navigate('/map')}
                className="p-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-100 transition-all flex items-start justify-between gap-3 cursor-pointer shadow-sm hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-extrabold text-slate-800">{inc.type}</span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                          inc.severity === 'CRITICAL'
                            ? 'bg-red-100 text-red-700'
                            : inc.severity === 'HIGH'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {inc.severity}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {inc.area}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 font-medium line-clamp-1">
                      {inc.description}
                    </p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 text-xs font-bold text-slate-400">
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
        onTriggerFlood={() => setShowIncidentModal(true)}
      />
    </div>
  );
};
