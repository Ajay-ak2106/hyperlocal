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
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyber-border/60 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyber-green animate-ping shadow-neon-green" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyber-green glow-text-green">
              TACTICAL GEO-OPS // CHENNAI CRISIS SECTOR
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-mono font-black text-white flex items-center gap-2 mt-0.5">
            <span>🌐</span>
            {language === 'ta' ? 'நேரலை பேரிடர் வரைபடம்' : 'LIVE GIS INCIDENT & RELIEF MAP'}
          </h1>
          <p className="text-xs font-mono text-slate-400">
            Realtime GCC/IMD geo-telemetry feed. Tap any sector icon or corridor for telemetry data.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap font-mono">
          <button
            onClick={() => setShowFloodModal(true)}
            className="px-3 py-2 rounded bg-cyber-cyan/10 border border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan hover:text-black font-bold text-xs flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,229,255,0.25)] active:scale-95 transition-all touch-target"
          >
            <Waves className="w-4 h-4" />
            <span>{language === 'ta' ? 'வெள்ளம் பதிவு' : 'Report Water Level'}</span>
          </button>

          <button
            onClick={() => setShowIncidentModal(true)}
            className="px-3 py-2 rounded bg-cyber-amber/10 border border-cyber-amber text-cyber-amber hover:bg-cyber-amber hover:text-black font-bold text-xs flex items-center gap-1.5 shadow-[0_0_12px_rgba(255,183,3,0.25)] active:scale-95 transition-all touch-target"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>{language === 'ta' ? 'விபத்து பதிவு' : 'Report Incident'}</span>
          </button>

          <button
            onClick={() => setShowHelpModal(true)}
            className="px-3 py-2 rounded bg-cyber-red/20 border border-cyber-red text-cyber-red hover:bg-cyber-red hover:text-white font-bold text-xs flex items-center gap-1.5 shadow-neon-red active:scale-95 transition-all touch-target"
          >
            <LifeBuoy className="w-4 h-4 animate-spin-slow" />
            <span>{language === 'ta' ? 'உதவி கேட்க' : 'Request Help'}</span>
          </button>
        </div>
      </div>

      {/* Real Map Canvas */}
      <IncidentMap onSelectIncident={(inc) => setSelectedIncident(inc)} />

      {/* Selected Incident Drawer */}
      {selectedIncident && (
        <div className="fixed bottom-16 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 z-50 sm:max-w-md w-full rounded-xl bg-cyber-panel border border-cyber-green/50 p-5 shadow-neon-green animate-in slide-in-from-bottom-4 relative">
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyber-green"></div>
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyber-green"></div>

          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-cyber-red/20 text-cyber-red border border-cyber-red/40 tracking-wider">
                [{selectedIncident.type}] // {selectedIncident.severity}
              </span>
              <h3 className="text-base font-mono font-extrabold text-white mt-1">
                {selectedIncident.area}
              </h3>
            </div>
            <button
              onClick={() => setSelectedIncident(null)}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-cyber-border transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-3 font-sans">
            {selectedIncident.description}
          </p>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-cyber-border">
            <span>STATUS: <strong className="text-cyber-green">{selectedIncident.status}</strong></span>
            <span>VERIFIED: <strong className="text-cyber-cyan">{selectedIncident.verification_status}</strong></span>
          </div>

          {selectedIncident.reporter_phone && (
            <a
              href={`tel:${selectedIncident.reporter_phone}`}
              className="mt-3 w-full py-2.5 rounded bg-cyber-red text-white font-mono font-bold text-xs flex items-center justify-center gap-2 hover:brightness-110 shadow-neon-red"
            >
              <PhoneCall className="w-4 h-4" />
              CALL REPORTER: {selectedIncident.reporter_phone}
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
