import React, { useState } from 'react';
import { IncidentMap } from '../components/map/IncidentMap.js';
import { Incident } from '../types/index.js';
import { Waves, LifeBuoy, AlertTriangle, PhoneCall, ExternalLink, X } from 'lucide-react';
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
      {/* Map Header with Floating Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <span>📍</span>
            {language === 'ta' ? 'நேரலை பேரிடர் வரைபடம்' : 'Live Incident & Shelter Map'}
          </h1>
          <p className="text-xs text-slate-400">
            Realtime database-driven points with live GPS updates. Tap markers for details.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowFloodModal(true)}
            className="px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 font-bold text-xs text-white flex items-center gap-1.5 shadow-lg shadow-sky-950 active:scale-95 touch-target"
          >
            <Waves className="w-4 h-4" />
            <span>{language === 'ta' ? 'வெள்ளம் பதிவு' : 'Report Flood'}</span>
          </button>

          <button
            onClick={() => setShowIncidentModal(true)}
            className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 font-bold text-xs text-white flex items-center gap-1.5 shadow-lg shadow-amber-950 active:scale-95 touch-target"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>{language === 'ta' ? 'விபத்து பதிவு' : 'Report Incident'}</span>
          </button>

          <button
            onClick={() => setShowHelpModal(true)}
            className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 font-bold text-xs text-white flex items-center gap-1.5 shadow-lg shadow-rose-950 active:scale-95 touch-target"
          >
            <LifeBuoy className="w-4 h-4" />
            <span>{language === 'ta' ? 'உதவி கேட்க' : 'Request Help'}</span>
          </button>
        </div>
      </div>

      {/* Real Map Canvas */}
      <IncidentMap onSelectIncident={(inc) => setSelectedIncident(inc)} />

      {/* Selected Incident Drawer */}
      {selectedIncident && (
        <div className="fixed bottom-16 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 z-50 sm:max-w-md w-full rounded-3xl bg-slate-900 border border-slate-700 p-5 shadow-2xl animate-in slide-in-from-bottom-4">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {selectedIncident.type} • {selectedIncident.severity}
              </span>
              <h3 className="text-base font-extrabold text-white mt-1">
                {selectedIncident.area}
              </h3>
            </div>
            <button
              onClick={() => setSelectedIncident(null)}
              className="p-1 rounded-xl text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            {selectedIncident.description}
          </p>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
            <span>Status: <strong className="text-white">{selectedIncident.status}</strong></span>
            <span>Verification: <strong className="text-emerald-400">{selectedIncident.verification_status}</strong></span>
          </div>

          {selectedIncident.reporter_phone && (
            <a
              href={`tel:${selectedIncident.reporter_phone}`}
              className="mt-3 w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 font-bold text-xs text-white flex items-center justify-center gap-2"
            >
              <PhoneCall className="w-4 h-4" />
              Call Reporter: {selectedIncident.reporter_phone}
            </a>
          )}
        </div>
      )}

      {/* Modals */}
      <RequestHelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />
      <ReportFloodModal isOpen={showFloodModal} onClose={() => setShowFloodModal(false)} />
      <ReportIncidentModal isOpen={showIncidentModal} onClose={() => setShowIncidentModal(false)} />
    </div>
  );
};
