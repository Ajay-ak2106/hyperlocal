import React, { useState, useEffect } from 'react';
import { BroadcastAlert } from '../../types/index.js';
import { AlertCircle, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.js';

export const AlertBanner: React.FC = () => {
  const { language } = useAuth();
  const [alerts, setAlerts] = useState<BroadcastAlert[]>([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setAlerts([
      {
        id: 'al-1',
        title: 'Flood Alert: High Inflow into Chembarambakkam & Velachery Lowlands',
        title_ta: 'வெள்ள எச்சரிக்கை: செம்பரம்பாக்கம் ஏரி உபரி நீர் திறப்பு - தாழ்வான பகுதி மக்கள் எச்சரிக்கை',
        description: 'Rescue boats & shelters active. Move vehicles to higher grounds.',
        description_ta: 'மீட்புப் படகுகள் மற்றும் முகாம்கள் தயார் நிலையில் உள்ளன.',
        severity: 'EMERGENCY',
        area: 'Chennai South',
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
    <div className="bg-gradient-to-r from-red-950 via-slate-900 to-slate-900 border-b border-red-500/40 px-3 py-2 sm:px-6 relative shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-red-600/30 border border-red-500/50 text-red-300 flex items-center justify-center flex-shrink-0 animate-pulse">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-900/70 text-red-200 border border-red-600/40 uppercase">
                {language === 'ta' ? 'அவசர எச்சரிக்கை' : 'Emergency Alert'}
              </span>
              <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight truncate">
                {title}
              </h4>
            </div>
            <p className="text-xs text-slate-300 truncate hidden sm:block mt-0.5">
              {desc}
            </p>
          </div>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          title="Dismiss"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
