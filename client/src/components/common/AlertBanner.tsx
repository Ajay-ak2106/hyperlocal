import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { BroadcastAlert } from '../../types/index.js';
import { AlertCircle, ChevronRight, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.js';

export const AlertBanner: React.FC = () => {
  const { language } = useAuth();
  const [alerts, setAlerts] = useState<BroadcastAlert[]>([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // In our seed data we had demo alerts
    // Let's fetch initial demo alerts or fallback to primary red alert
    setAlerts([
      {
        id: 'al-1',
        title: 'RED ALERT: Heavy Inflow into Chembarambakkam & Velachery Inundation',
        title_ta: 'சிவப்பு எச்சரிக்கை: செம்பரம்பாக்கம் ஏரி உபரி நீர் திறப்பு - வேளச்சேரி பகுதி மக்கள் எச்சரிக்கை',
        description: 'NDRF deployed. Avoid low-lying underpasses and ground floors.',
        description_ta: 'தேசிய பேரிடர் மீட்புப் படை களத்தில் உள்ளது. தாழ்வான பகுதிகளைத் தவிர்க்கவும்.',
        severity: 'EMERGENCY',
        area: 'South Chennai Zone',
        active: 1,
        created_at: new Date().toISOString()
      }
    ]);
  }, []);

  if (dismissed || alerts.length === 0) return null;

  const currentAlert = alerts[0];
  const title = language === 'ta' && currentAlert.title_ta ? currentAlert.title_ta : currentAlert.title;
  const desc = language === 'ta' && currentAlert.description_ta ? currentAlert.description_ta : currentAlert.description;

  return (
    <div className="bg-gradient-to-r from-[#1a050b] via-cyber-panel to-cyber-bg border-b border-cyber-red/50 px-3 py-2 sm:px-6 relative shadow-[0_4px_20px_rgba(255,42,85,0.2)]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-sm bg-cyber-red/20 border border-cyber-red text-cyber-red flex items-center justify-center flex-shrink-0 animate-pulse shadow-[0_0_10px_rgba(255,42,85,0.5)]">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyber-red/30 text-cyber-red border border-cyber-red/50 uppercase tracking-wider">
                {currentAlert.severity} // TNDMA
              </span>
              <h4 className="text-xs sm:text-sm font-mono font-bold text-white tracking-tight truncate">
                {title}
              </h4>
            </div>
            <p className="text-[11px] text-slate-300/80 font-sans truncate hidden sm:block">
              {desc}
            </p>
          </div>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="text-slate-400 hover:text-cyber-red p-1 rounded transition-colors"
          title="Dismiss alert banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
