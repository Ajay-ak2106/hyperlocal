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
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSelectStatus = async (selectedStatus: SafetyStatus) => {
    setLoading(true);

    try {
      await api.submitSafetyCheckin({
        user_id: user?.id || 'user-citizen-1',
        user_name: profile?.name || 'Citizen',
        user_phone: profile?.mobile_number || '+91 98765 43210',
        status: selectedStatus,
        note: note || (selectedStatus === 'SAFE' ? 'Safe in current location' : 'Status reported'),
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl relative text-center">
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase">
            <ShieldCheck className="w-4 h-4" />
            <span>{language === 'ta' ? 'பாதுகாப்பு பதிவு' : 'Citizen Safety Check-in'}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-10 flex flex-col items-center justify-center">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-3" />
            <h4 className="text-lg font-bold text-white">
              {language === 'ta' ? 'உங்கள் நிலை பதிவு செய்யப்பட்டது!' : 'Safety Status Recorded!'}
            </h4>
            <p className="text-xs text-slate-300 mt-1">
              {language === 'ta'
                ? 'உங்கள் பாதுகாப்பு நிலை வெற்றிகரமாகப் பதிவு செய்யப்பட்டது.'
                : 'Your status has been updated in the disaster management portal.'}
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-4 text-left">
            <div>
              <h3 className="text-base font-bold text-white">
                {language === 'ta' ? 'உங்கள் பாதுகாப்பு நிலைமை என்ன?' : 'How are you doing right now?'}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                {language === 'ta'
                  ? `${currentArea} பகுதியில் உங்கள் நிலையை ஒரு தட்டில் பதிவு செய்யவும்.`
                  : `One-tap safety check-in for ${currentArea}.`}
              </p>
            </div>

            <div className="space-y-2.5">
              {/* Option 1: Safe */}
              <button
                disabled={loading}
                onClick={() => handleSelectStatus('SAFE')}
                className="w-full p-4 rounded-xl border border-emerald-500/40 bg-emerald-950/40 hover:bg-emerald-900/60 text-white flex items-center gap-3 transition-all active:scale-98 text-left shadow-sm"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-600/30 flex items-center justify-center text-xl flex-shrink-0">
                  🟢
                </div>
                <div>
                  <div className="text-sm font-bold text-emerald-300">
                    {language === 'ta' ? 'நான் பாதுகாப்பாக உள்ளேன்' : 'I Am Safe'}
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">
                    {language === 'ta' ? 'ஆபத்து ஏதுமில்லை, வீட்டில் உள்ளேன்' : 'Safe at home or relief shelter, no danger'}
                  </div>
                </div>
              </button>

              {/* Option 2: Need Assistance */}
              <button
                disabled={loading}
                onClick={() => handleSelectStatus('NEED_HELP')}
                className="w-full p-4 rounded-xl border border-amber-500/40 bg-amber-950/40 hover:bg-amber-900/60 text-white flex items-center gap-3 transition-all active:scale-98 text-left shadow-sm"
              >
                <div className="w-10 h-10 rounded-full bg-amber-600/30 flex items-center justify-center text-xl flex-shrink-0">
                  🟡
                </div>
                <div>
                  <div className="text-sm font-bold text-amber-300">
                    {language === 'ta' ? 'உதவி தேவைப்படுகிறது' : 'Need Food / Water / Medicine'}
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">
                    {language === 'ta' ? 'அத்தியாவசியப் பொருட்கள் தேவை' : 'Need non-critical supplies or charging'}
                  </div>
                </div>
              </button>

              {/* Option 3: Critical Danger */}
              <button
                disabled={loading}
                onClick={() => handleSelectStatus('EMERGENCY')}
                className="w-full p-4 rounded-xl border border-red-500/40 bg-red-950/40 hover:bg-red-900/60 text-white flex items-center gap-3 transition-all active:scale-98 text-left shadow-sm"
              >
                <div className="w-10 h-10 rounded-full bg-red-600/30 flex items-center justify-center text-xl flex-shrink-0">
                  🔴
                </div>
                <div>
                  <div className="text-sm font-bold text-red-300">
                    {language === 'ta' ? 'ஆபத்தான நிலையில் உள்ளேன் (SOS)' : 'In Immediate Danger / Rescue Needed'}
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">
                    {language === 'ta' ? 'வெள்ளம் சூழ்ந்துள்ளது, படகு மீட்பு தேவை' : 'Water entered house, urgent boat rescue needed'}
                  </div>
                </div>
              </button>
            </div>

            {/* Optional note */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {language === 'ta' ? 'கூடுதல் விவரம் (விருப்பத்தேர்வு):' : 'Optional note:'}
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={language === 'ta' ? 'எ.கா: 2-ம் தளத்தில் உள்ளோம்' : 'e.g. Safe on 2nd floor with 2 family members'}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white placeholder-slate-400 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
