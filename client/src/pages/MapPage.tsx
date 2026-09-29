import React, { useState } from 'react';
import { IncidentMap } from '../components/map/IncidentMap.js';
import { Incident } from '../types/index.js';
import { Waves, LifeBuoy, AlertTriangle, PhoneCall, X } from 'lucide-react';
import { RequestHelpModal } from '../components/modals/RequestHelpModal.js';
import { ReportFloodModal } from '../components/modals/ReportFloodModal.js';
import { ReportIncidentModal } from '../components/modals/ReportIncidentModal.js';
import { useAuth } from '../contexts/AuthContext.js';

export const MapPage: React.FC = () => {
  const { language } = useAuth();
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showFloodModal, setShowFloodModal] = useState(false);
  const [showIncidentModal, setShowIncidentModal] = useState(false);

  return (
    <div className="pb-20 pt-2 px-2 sm:px-6 max-w-7xl mx-auto space-y-3">
      {/* Accessible Natural Map Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/70 pb-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <span>🌐</span>
            {language === 'ta' ? 'நேரலை பேரிடர் வரைபடம்' : 'Live Disaster & Relief Map'}
          </h1>
          <p className="text-xs text-slate-300">
            {language === 'ta'
              ? 'வெள்ள நிலவரம், நிவாரண பாதைகள் மற்றும் முகாம்கள்.'
              : 'Interactive map of flood zones, safe relief corridors, and shelters.'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <button
            onClick={() => setShowFloodModal(true)}
            className="px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <Waves className="w-4 h-4" />
            <span>{language === 'ta' ? 'வெள்ளம் பதிவு' : 'Report Flood'}</span>
          </button>

          <button
            onClick={() => setShowIncidentModal(true)}
            className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>{language === 'ta' ? 'விபத்து பதிவு' : 'Report Incident'}</span>
          </button>

          <button
            onClick={() => setShowHelpModal(true)}
            className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <LifeBuoy className="w-4 h-4" />
            <span>{language === 'ta' ? 'உதவி கேட்க' : 'Request Help (SOS)'}</span>
          </button>
        </div>
      </div>

      {/* Real Map Canvas with Generous Height */}
      <IncidentMap
        height="calc(100vh - 220px)"
        onSelectIncident={(inc) => setSelectedIncident(inc)}
      />

      {/* Selected Incident Drawer / Card */}
      {selectedIncident && (
        <div className="fixed bottom-16 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 z-50 sm:max-w-md w-full rounded-2xl bg-slate-900 border border-slate-700 p-5 shadow-2xl animate-in slide-in-from-bottom-4">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded ${
                selectedIncident.severity === 'CRITICAL'
                  ? 'bg-red-900/60 text-red-200 border border-red-500/40'
                  : 'bg-amber-900/60 text-amber-200 border border-amber-500/40'
              }`}>
                {selectedIncident.type} • {selectedIncident.severity}
              </span>
              <h3 className="text-base font-bold text-white mt-1">
                {selectedIncident.area}
              </h3>
            </div>
            <button
              onClick={() => setSelectedIncident(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close details"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            {selectedIncident.description}
          </p>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
            <span>Status: <strong className="text-emerald-400">{selectedIncident.status}</strong></span>
            <span>Verified: <strong className="text-sky-400">{selectedIncident.verification_status}</strong></span>
          </div>

          {selectedIncident.reporter_phone && (
            <a
              href={`tel:${selectedIncident.reporter_phone}`}
              className="mt-3 w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call Reporter ({selectedIncident.reporter_phone})</span>
            </a>
          )}
        </div>
      )}

      {/* Modals */}
      <RequestHelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />
      <ReportFloodModal
        isOpen={showFloodModal}
        onClose={() => setShowFloodModal(false)}
      />
      <ReportIncidentModal
        isOpen={showIncidentModal}
        onClose={() => setShowIncidentModal(false)}
      />
    </div>
  );
};
