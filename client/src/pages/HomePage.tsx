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
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RequestHelpModal } from '../components/modals/RequestHelpModal.js';
import { ReportFloodModal } from '../components/modals/ReportFloodModal.js';
import { SafetyCheckinModal } from '../components/modals/SafetyCheckinModal.js';
import { DonateModal } from '../components/modals/DonateModal.js';
import { HelplinesModal } from '../components/modals/HelplinesModal.js';
import { VoiceAssistantModal } from '../components/common/VoiceAssistantModal.js';

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
      const [safetyData, incidentsData] = await Promise.all([
        api.getSafetyStats(),
        api.getIncidents({ area: currentArea })
      ]);
      setSafetySummary(safetyData.summary);
      setRecentIncidents(incidentsData.slice(0, 5));
    } catch (e) {
      console.warn('Error fetching homepage live data:', e);
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, [currentArea, lastRealtimeEvent]);

  return (
    <div className="pb-24 pt-3 px-3 sm:px-6 max-w-7xl mx-auto space-y-5">
      {/* Hyperlocal Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-rose-950/40 border border-slate-800 p-5 sm:p-7 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                📍 {currentArea} Sector
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {language === 'ta' ? 'அதிவேக பேரிடர் ஒருங்கிணைப்பு' : 'Hyperlocal Rapid Response'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {language === 'ta' ? 'உடனடி உதவி மற்றும் சமூக பாதுகாப்பு' : 'Emergency Aid & Community Safety'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
              {language === 'ta'
                ? 'வெள்ளம், அவசர மருத்துவம், மற்றும் மீட்புப் பணிகளுக்கு கீழேயுள்ள ஒரு-தட்டு பட்டன்களைப் பயன்படுத்தவும்.'
                : 'Simple one-tap actions for floods, medical help, and volunteer rescue. Simplicity saves lives.'}
            </p>
          </div>

          {/* Quick Voice Trigger Floating Button */}
          <button
            onClick={() => setShowVoiceModal(true)}
            className="flex-shrink-0 flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-extrabold text-xs shadow-xl shadow-rose-950 active:scale-95 transition-all touch-target"
          >
            <Mic className="w-5 h-5 animate-pulse" />
            <span>{language === 'ta' ? 'குரல் உதவி (பேசுக)' : 'VOICE ASSISTANT'}</span>
          </button>
        </div>

        {/* Live SQL Aggregate Safety Ticker (Requirement #21 - Never hard-coded) */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-400 uppercase tracking-wider text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{language === 'ta' ? 'சமூக பாதுகாப்பு நிலவரம்:' : 'Community Safety Status:'}</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap font-bold">
            <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <span>🟢</span> {safetySummary.SAFE} {language === 'ta' ? 'நலம்' : 'Safe'}
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
              <span>🟡</span> {safetySummary.NEED_HELP} {language === 'ta' ? 'உதவி தேவை' : 'Need Help'}
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5 animate-pulse">
              <span>🔴</span> {safetySummary.EMERGENCY} {language === 'ta' ? 'அவசரம்' : 'Emergency'}
            </span>
          </div>
        </div>
      </div>

      {/* Main 2 High-Priority Action Buttons (Hero Size) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-5">
        {/* REQUEST HELP */}
        <button
          onClick={() => setShowHelpModal(true)}
          className="relative group overflow-hidden rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white shadow-2xl shadow-rose-950/80 flex items-center justify-between transition-all duration-200 active:scale-98 touch-target border border-rose-400/30"
        >
          <div className="flex items-center gap-4 text-left">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner flex-shrink-0">
              🆘
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black tracking-tight leading-none mb-1">
                {t.requestHelp}
              </div>
              <p className="text-xs text-rose-100/90 font-medium">
                {language === 'ta'
                  ? 'மருத்துவம், ஆம்புலன்ஸ், உணவு, படகு மீட்பு'
                  : 'Medical, Ambulance, Food, Boat Rescue'}
              </p>
            </div>
          </div>
          <ArrowRight className="w-6 h-6 stroke-[3px] group-hover:translate-x-1.5 transition-transform" />
        </button>

        {/* REPORT FLOOD */}
        <button
          onClick={() => setShowFloodModal(true)}
          className="relative group overflow-hidden rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white shadow-2xl shadow-sky-950/80 flex items-center justify-between transition-all duration-200 active:scale-98 touch-target border border-sky-400/30"
        >
          <div className="flex items-center gap-4 text-left">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner flex-shrink-0">
              🌊
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black tracking-tight leading-none mb-1">
                {t.reportFlood}
              </div>
              <p className="text-xs text-sky-100/90 font-medium">
                {language === 'ta'
                  ? 'நீர்மட்டம், தெரு நிலை, AI மதிப்பீடு'
                  : 'Water level, photo, AI level estimate'}
              </p>
            </div>
          </div>
          <ArrowRight className="w-6 h-6 stroke-[3px] group-hover:translate-x-1.5 transition-transform" />
        </button>
      </div>

      {/* Grid of Secondary 1-Tap Emergency Cards */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">
          {language === 'ta' ? 'அதிவேக அவசரச் செயல்பாடுகள்' : 'Rapid Emergency Services'}
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* I AM SAFE */}
          <button
            onClick={() => setShowSafetyModal(true)}
            className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-emerald-500/40 hover:border-emerald-500 text-emerald-400 transition-all active:scale-95 touch-target shadow-lg shadow-emerald-950/20 group"
          >
            <span className="text-3xl mb-1.5 group-hover:scale-110 transition-transform">🟢</span>
            <span className="font-extrabold text-sm text-white">{t.iAmSafe}</span>
            <span className="text-[10px] text-slate-400 mt-0.5">
              {language === 'ta' ? 'பாதுகாப்பு பதிவு' : 'Check-in Safe'}
            </span>
          </button>

          {/* INCIDENT MAP */}
          <button
            onClick={() => navigate('/map')}
            className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-rose-500 text-rose-400 transition-all active:scale-95 touch-target shadow-lg group"
          >
            <span className="text-3xl mb-1.5 group-hover:scale-110 transition-transform">📍</span>
            <span className="font-extrabold text-sm text-white">{t.incidentMap}</span>
            <span className="text-[10px] text-slate-400 mt-0.5">
              {language === 'ta' ? 'நேரடி வரைபடம்' : 'Live Incident Map'}
            </span>
          </button>

          {/* VOLUNTEER */}
          <button
            onClick={() => navigate('/volunteer')}
            className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-blue-500 text-blue-400 transition-all active:scale-95 touch-target shadow-lg group"
          >
            <span className="text-3xl mb-1.5 group-hover:scale-110 transition-transform">🙋</span>
            <span className="font-extrabold text-sm text-white">{t.volunteer}</span>
            <span className="text-[10px] text-slate-400 mt-0.5">
              {language === 'ta' ? 'மீட்புப் பணி' : 'Rescue & Aid'}
            </span>
          </button>

          {/* SHELTERS */}
          <button
            onClick={() => navigate('/shelters')}
            className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500 text-emerald-400 transition-all active:scale-95 touch-target shadow-lg group"
          >
            <span className="text-3xl mb-1.5 group-hover:scale-110 transition-transform">🏠</span>
            <span className="font-extrabold text-sm text-white">{t.shelters}</span>
            <span className="text-[10px] text-slate-400 mt-0.5">
              {language === 'ta' ? 'நிவாரண முகாம்கள்' : 'Safe Camps & Capacity'}
            </span>
          </button>

          {/* RESOURCES */}
          <button
            onClick={() => navigate('/resources')}
            className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-purple-500 text-purple-400 transition-all active:scale-95 touch-target shadow-lg group"
          >
            <span className="text-3xl mb-1.5 group-hover:scale-110 transition-transform">📦</span>
            <span className="font-extrabold text-sm text-white">{t.resources}</span>
            <span className="text-[10px] text-slate-400 mt-0.5">
              {language === 'ta' ? 'உணவு, குடிநீர், படகுகள்' : 'Food, Boats & Solar'}
            </span>
          </button>

          {/* COMMUNITY */}
          <button
            onClick={() => navigate('/community')}
            className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500 text-amber-400 transition-all active:scale-95 touch-target shadow-lg group"
          >
            <span className="text-3xl mb-1.5 group-hover:scale-110 transition-transform">👥</span>
            <span className="font-extrabold text-sm text-white">{t.community}</span>
            <span className="text-[10px] text-slate-400 mt-0.5">
              {language === 'ta' ? 'உள்ளூர் நேரலை பதிவுகள்' : 'Ward Safety Feed'}
            </span>
          </button>

          {/* RELIEF FUND */}
          <button
            onClick={() => setShowDonateModal(true)}
            className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-pink-500 text-pink-400 transition-all active:scale-95 touch-target shadow-lg group"
          >
            <span className="text-3xl mb-1.5 group-hover:scale-110 transition-transform">💰</span>
            <span className="font-extrabold text-sm text-white">{t.reliefFund}</span>
            <span className="text-[10px] text-slate-400 mt-0.5">
              {language === 'ta' ? 'நிவாரண நிதி' : 'Transparent Relief'}
            </span>
          </button>

          {/* HELPLINES */}
          <button
            onClick={() => setShowHelplineModal(true)}
            className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-rose-500/40 hover:border-rose-500 text-rose-400 transition-all active:scale-95 touch-target shadow-lg group"
          >
            <span className="text-3xl mb-1.5 group-hover:scale-110 transition-transform">📞</span>
            <span className="font-extrabold text-sm text-white">{t.helplines}</span>
            <span className="text-[10px] text-slate-400 mt-0.5">
              {language === 'ta' ? '108, 100, 1070' : '108, 100, 1070, 1913'}
            </span>
          </button>
        </div>
      </div>

      {/* Live Hyperlocal Incidents Feed (Loaded from Database) */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-rose-400" />
            <h2 className="text-sm font-black text-white">
              {language === 'ta' ? 'அண்மைப் பேரிடர் அறிக்கைகள்' : 'Recent Incidents in Ward'}
            </h2>
          </div>
          <button
            onClick={() => navigate('/map')}
            className="text-xs text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1"
          >
            <span>{language === 'ta' ? 'அனைத்தும் பார்க்க' : 'View on Map'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2.5">
          {recentIncidents.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
              No reported incidents in {currentArea} at this moment. Stay safe!
            </div>
          ) : (
            recentIncidents.map((inc) => (
              <div
                key={inc.id}
                onClick={() => navigate('/map')}
                className="p-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 transition-all flex items-start justify-between gap-3 cursor-pointer shadow-sm group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-105 transition-transform">
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
                      <span className="text-xs font-black text-white">{inc.type}</span>
                      <span
                        className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                          inc.severity === 'CRITICAL'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : inc.severity === 'HIGH'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {inc.severity}
                      </span>
                      <span className="text-[10px] text-slate-500">📍 {inc.area}</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-snug line-clamp-2">
                      {inc.description}
                    </p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="text-[10px] text-slate-500 font-mono block">
                    {new Date(inc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-[9px] font-bold uppercase text-emerald-400 mt-1 block">
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
