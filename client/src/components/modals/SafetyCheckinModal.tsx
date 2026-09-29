import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.js';
import { api } from '../../services/api.js';
import { SafetyStatus } from '../../types/index.js';
import { ShieldCheck, CheckCircle2, AlertTriangle, AlertOctagon, X, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SafetyCheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const SafetyCheckinModal: React.FC<SafetyCheckinModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user, profile, currentArea, coords, language } = useAuth();
  const [status, setStatus] = useState<SafetyStatus>('SAFE');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSelectStatus = async (selectedStatus: SafetyStatus) => {
    setStatus(selectedStatus);
    setLoading(true);

    try {
      await api.submitSafetyCheckin({
        user_id: user?.id || 'user-citizen-1',
        user_name: profile?.name || 'Citizen',
        user_phone: profile?.mobile_number || '+91 98765 43210',
        status: selectedStatus,
        note: note || (selectedStatus === 'SAFE' ? 'Reported safe in ward' : 'Needs attention'),
        area: currentArea,
        latitude: coords.latitude,
        longitude: coords.longitude,
        is_demo: 1
      });

      if (selectedStatus === 'SAFE') {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      }

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
        if (onSuccess) onSuccess();
      }, 1400);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-cyber-panel border border-cyber-green/50 p-6 shadow-neon-green relative text-center">
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyber-green"></div>
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyber-green"></div>

        <div className="flex justify-between items-center pb-3 border-b border-cyber-border font-mono">
          <div className="flex items-center gap-2 text-cyber-green font-bold text-xs uppercase glow-text-green">
            <ShieldCheck className="w-4 h-4 animate-pulse" />
            [CIVIC HUD // {language === 'ta' ? 'பாதுகாப்பு சரிபார்ப்பு' : 'SAFETY TELEMETRY CHECK-IN'}]
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-10 flex flex-col items-center justify-center font-mono">
            <CheckCircle2 className="w-16 h-16 text-cyber-green animate-bounce mb-3 glow-text-green" />
            <h4 className="text-lg font-bold text-white uppercase">
              {language === 'ta' ? 'உங்கள் நிலை பதிவு செய்யப்பட்டது!' : 'SAFETY TELEMETRY BROADCASTED!'}
            </h4>
            <p className="text-xs text-slate-400 font-sans mt-1">
              {language === 'ta'
                ? 'சமூக பாதுகாப்பு பலகையில் எண்ணிக்கை உடனடியாகப் புதுப்பிக்கப்பட்டது.'
                : 'Central Command & Ward HUD telemetry have been refreshed.'}
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-4 font-mono">
            <h3 className="text-base sm:text-lg font-mono font-bold text-white tracking-wide">
              {language === 'ta' ? 'உங்கள் நிலைமை என்ன?' : 'TRANSMIT CURRENT OPERATIONAL STATUS:'}
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto font-sans">
              {language === 'ta'
                ? 'உங்கள் பகுதிக்கான அவசர பாதுகாப்பு நிலையை ஒரு தட்டில் பதிவு செய்யவும்.'
                : 'Broadcast verified coordinates & status instantly to NDRF/GCC incident roster.'}
            </p>

            <div className="space-y-2.5 pt-2">
              {/* Green Safe Button */}
              <button
                disabled={loading}
                onClick={() => handleSelectStatus('SAFE')}
                className="w-full py-3.5 px-4 rounded-xl bg-cyber-bg hover:bg-cyber-green/15 active:scale-98 text-white font-mono font-bold text-sm shadow-md hover:shadow-neon-green flex items-center justify-between transition-all touch-target border border-cyber-green/50 group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🟢</span>
                  <div className="text-left">
                    <div className="leading-tight group-hover:text-cyber-green">
                      {language === 'ta' ? 'நான் பாதுகாப்பாக இருக்கிறேன்' : 'STATUS: SAFE // NOMINAL'}
                    </div>
                    <span className="text-[10px] font-sans text-slate-400">
                      {language === 'ta' ? 'உணவு, குடிநீர் மற்றும் பாதுகாப்பு உள்ளது' : 'Shelter secure, food & water available'}
                    </span>
                  </div>
                </div>
                <CheckCircle2 className="w-5 h-5 text-cyber-green stroke-[2.5px]" />
              </button>

              {/* Yellow Need Help */}
              <button
                disabled={loading}
                onClick={() => handleSelectStatus('NEED_HELP')}
                className="w-full py-3.5 px-4 rounded-xl bg-cyber-bg hover:bg-cyber-amber/15 active:scale-98 text-white font-mono font-bold text-sm shadow-md hover:shadow-[0_0_15px_rgba(255,183,3,0.3)] flex items-center justify-between transition-all touch-target border border-cyber-amber/50 group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🟡</span>
                  <div className="text-left">
                    <div className="leading-tight group-hover:text-cyber-amber">
                      {language === 'ta' ? 'எனக்கு உதவி தேவை' : 'STATUS: ASSISTANCE REQUESTED'}
                    </div>
                    <span className="text-[10px] font-sans text-slate-400">
                      {language === 'ta' ? 'உணவு, குடிநீர் அல்லது மீட்பு தேவை' : 'Requires rations, power, or non-critical aid'}
                    </span>
                  </div>
                </div>
                <AlertTriangle className="w-5 h-5 text-cyber-amber stroke-[2.5px]" />
              </button>

              {/* Red Emergency */}
              <button
                disabled={loading}
                onClick={() => handleSelectStatus('EMERGENCY')}
                className="w-full py-3.5 px-4 rounded-xl bg-cyber-red/20 hover:bg-cyber-red active:scale-98 text-white font-mono font-bold text-sm shadow-neon-red flex items-center justify-between transition-all touch-target border border-cyber-red animate-pulse group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🔴</span>
                  <div className="text-left">
                    <div className="leading-tight text-cyber-red group-hover:text-white">
                      {language === 'ta' ? 'அவசர ஆபத்தில் உள்ளேன்' : 'CRITICAL SOS // LIFE THREAT'}
                    </div>
                    <span className="text-[10px] font-sans text-slate-300">
                      {language === 'ta' ? 'உடனடி மீட்பு தேவைப்படுகிறது' : 'Immediate boat evacuation or paramedic sortie'}
                    </span>
                  </div>
                </div>
                <AlertOctagon className="w-5 h-5 text-cyber-red group-hover:text-white stroke-[2.5px]" />
              </button>
            </div>

            {/* Optional note */}
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={language === 'ta' ? 'கூடுதல் தகவல் (விருப்பத்தேர்வு)...' : 'Tactical note (e.g. stranded on 2nd floor, elderly inside)...'}
              className="w-full mt-3 rounded bg-cyber-bg border border-cyber-border px-3 py-2 text-xs text-white placeholder-slate-500 font-sans focus:border-cyber-green outline-none"
            />
          </div>
        )}
      </div>
    </div>
  );
};
