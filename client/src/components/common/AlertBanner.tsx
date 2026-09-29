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
    <div className="bg-gradient-to-r from-rose-900/90 via-red-900/90 to-rose-950/90 border-b border-rose-600/50 px-3 py-2 sm:px-6 relative shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center flex-shrink-0 animate-pulse">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-black text-white tracking-tight truncate">
              {title}
            </h4>
            <p className="text-[11px] text-rose-200/90 truncate hidden sm:block">
              {desc}
            </p>
          </div>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="text-rose-300 hover:text-white p-1 rounded-lg"
          title="Dismiss alert banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
