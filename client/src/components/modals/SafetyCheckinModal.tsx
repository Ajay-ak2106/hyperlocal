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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl relative text-center">
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm uppercase tracking-wider">
            <ShieldCheck className="w-5 h-5" />
            {language === 'ta' ? 'பாதுகாப்பு சரிபார்ப்பு' : 'Community Safety Check-in'}
          </div>
          <button onClick={onClose} className="p-1 rounded-xl text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-10 flex flex-col items-center justify-center">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 animate-bounce mb-3" />
            <h4 className="text-lg font-black text-white">
              {language === 'ta' ? 'உங்கள் நிலை பதிவு செய்யப்பட்டது!' : 'Safety Status Recorded!'}
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              {language === 'ta'
                ? 'சமூக பாதுகாப்பு பலகையில் எண்ணிக்கை உடனடியாகப் புதுப்பிக்கப்பட்டது.'
                : 'Ward coordinator dashboard has been updated in real-time.'}
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            <h3 className="text-lg font-extrabold text-white">
              {language === 'ta' ? 'உங்கள் நிலைமை என்ன?' : 'How is your current situation?'}
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              {language === 'ta'
                ? 'உங்கள் பகுதிக்கான அவசர பாதுகாப்பு நிலையை ஒரு தட்டில் பதிவு செய்யவும்.'
                : 'Tap once to notify your family, community, and local disaster volunteers.'}
            </p>

            <div className="space-y-3 pt-2">
              {/* Green Safe Button */}
              <button
                disabled={loading}
                onClick={() => handleSelectStatus('SAFE')}
                className="w-full py-4 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-base shadow-xl shadow-emerald-950/80 flex items-center justify-between transition-all touch-target border border-emerald-400/30"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🟢</span>
                  <div className="text-left">
                    <div className="leading-tight">
                      {language === 'ta' ? 'நான் பாதுகாப்பாக இருக்கிறேன்' : 'I AM SAFE'}
                    </div>
                    <span className="text-[11px] font-medium opacity-80">
                      {language === 'ta' ? 'உணவு, குடிநீர் மற்றும் பாதுகாப்பு உள்ளது' : 'Have dry shelter, food & water'}
                    </span>
                  </div>
                </div>
                <CheckCircle2 className="w-6 h-6 stroke-[2.5px]" />
              </button>

              {/* Yellow Need Help */}
              <button
                disabled={loading}
                onClick={() => handleSelectStatus('NEED_HELP')}
                className="w-full py-4 px-5 rounded-2xl bg-amber-600 hover:bg-amber-500 active:scale-95 text-white font-black text-base shadow-xl shadow-amber-950/80 flex items-center justify-between transition-all touch-target border border-amber-400/30"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🟡</span>
                  <div className="text-left">
                    <div className="leading-tight">
                      {language === 'ta' ? 'எனக்கு உதவி தேவை' : 'I NEED HELP'}
                    </div>
                    <span className="text-[11px] font-medium opacity-80">
                      {language === 'ta' ? 'உணவு, குடிநீர் அல்லது மீட்பு தேவை' : 'Non-critical aid or supplies needed'}
                    </span>
                  </div>
                </div>
                <AlertTriangle className="w-6 h-6 stroke-[2.5px]" />
              </button>

              {/* Red Emergency */}
              <button
                disabled={loading}
                onClick={() => handleSelectStatus('EMERGENCY')}
                className="w-full py-4 px-5 rounded-2xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-black text-base shadow-xl shadow-rose-950/80 flex items-center justify-between transition-all touch-target border border-rose-400/30 animate-pulse-fast"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🔴</span>
                  <div className="text-left">
                    <div className="leading-tight">
                      {language === 'ta' ? 'அவசர ஆபத்தில் உள்ளேன்' : 'CRITICAL EMERGENCY'}
                    </div>
                    <span className="text-[11px] font-medium opacity-80">
                      {language === 'ta' ? 'உடனடி மீட்பு தேவைப்படுகிறது' : 'Immediate life-saving response needed'}
                    </span>
                  </div>
                </div>
                <AlertOctagon className="w-6 h-6 stroke-[2.5px]" />
              </button>
            </div>

            {/* Optional note */}
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={language === 'ta' ? 'கூடுதல் தகவல் (விருப்பத்தேர்வு)...' : 'Optional note (e.g. at 2nd floor)...'}
              className="w-full mt-3 rounded-xl bg-slate-950/80 border border-slate-700 px-3 py-2 text-xs text-white"
            />
          </div>
        )}
      </div>
    </div>
  );
};
