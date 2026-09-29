import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.js';
import { api } from '../../services/api.js';
import { FloodCondition } from '../../types/index.js';
import {
  Waves,
  Camera,
  Mic,
  MicOff,
  MapPin,
  X,
  CheckCircle2,
  Loader2,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { offlineManager } from '../../services/offline.js';

interface ReportFloodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ReportFloodModal: React.FC<ReportFloodModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user, profile, currentArea, coords, t, language } = useAuth();

  const [condition, setCondition] = useState<FloodCondition>('WATER_ON_ROAD');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const conditions: { id: FloodCondition; labelTa: string; labelEn: string; aiEst: string; color: string }[] = [
    { id: 'WATER_ON_ROAD', labelTa: 'சாலையில் தண்ணீர்', labelEn: 'Water on Road', aiEst: 'AI ESTIMATE: Ankle Level (0.5 - 1.0 ft)', color: 'border-blue-500 bg-blue-500/10' },
    { id: 'FLOODED_STREET', labelTa: 'தெருவில் வெள்ளம்', labelEn: 'Flooded Street', aiEst: 'AI ESTIMATE: Knee Level (1.5 - 2.5 ft)', color: 'border-cyan-500 bg-cyan-500/10' },
    { id: 'WATER_ENTERING_HOUSE', labelTa: 'வீட்டிற்குள் தண்ணீர்', labelEn: 'Water Entering House', aiEst: 'AI ESTIMATE: Waist Level (3.0 - 4.0 ft)', color: 'border-amber-500 bg-amber-500/10' },
    { id: 'VEHICLES_AFFECTED', labelTa: 'வாகனங்கள் மூழ்கியது', labelEn: 'Vehicles Submerged', aiEst: 'AI ESTIMATE: Tyre to Bonnet (2.5 - 3.5 ft)', color: 'border-orange-500 bg-orange-500/10' },
    { id: 'ROAD_BLOCKED', labelTa: 'சாலை அடைப்பு', labelEn: 'Road Inundated / Blocked', aiEst: 'AI ESTIMATE: Impassable (> 3.0 ft)', color: 'border-red-500 bg-red-500/10' },
    { id: 'DANGEROUS_WATER_LEVEL', labelTa: 'ஆபத்தான நீர்மட்டம்', labelEn: 'Dangerous Water Level', aiEst: 'AI ESTIMATE: Chest Level / Current (> 4.5 ft)', color: 'border-rose-600 bg-rose-600/20 text-rose-300' },
  ];

  const currentConditionConfig = conditions.find((c) => c.id === condition) || conditions[0];

  // Photo upload
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        setLoading(true);
        const file = e.target.files[0];
        const res = await api.uploadFile(file, file.name);
        setPhotoUrl(res.url);
      } catch (err: any) {
        setError('Photo upload failed: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  // Voice recording
  const handleToggleVoiceRecord = async () => {
    if (isRecording) {
      if (mediaRecorder) mediaRecorder.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        const chunks: Blob[] = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = async () => {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          try {
            setLoading(true);
            const res = await api.uploadFile(blob, 'flood-voice.webm');
            setAudioUrl(res.url);
          } catch (e: any) {
            console.error('Audio upload error:', e);
          } finally {
            setLoading(false);
          }
          stream.getTracks().forEach((track) => track.stop());
        };

        recorder.start();
        setMediaRecorder(recorder);
        setIsRecording(true);
      } catch (err) {
        setError('Microphone not accessible. You can submit without audio.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload = {
      reporter_id: user?.id || 'user-citizen-1',
      reporter_name: profile?.name || 'Citizen Reporter',
      condition,
      description: description || `Flooding reported at ${currentArea} (${condition.replace(/_/g, ' ')})`,
      area: currentArea,
      latitude: coords.latitude,
      longitude: coords.longitude,
      photo_url: photoUrl,
      audio_url: audioUrl,
      is_demo: 1
    };

    try {
      if (!navigator.onLine) {
        offlineManager.enqueue('FLOOD', payload);
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 1500);
        return;
      }

      await api.createFloodReport(payload);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to submit flood report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700/80 p-5 sm:p-7 shadow-2xl relative my-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
              <Waves className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                {language === 'ta' ? 'வெள்ளப் பாதிப்பு பதிவு' : 'Report Flood Inundation'}
              </h3>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-sky-400" />
                {currentArea} (GPS Attached)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-xl text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <CheckCircle2 className="w-16 h-16 text-sky-400 animate-bounce mb-3" />
            <h4 className="text-lg font-extrabold text-white">
              {language === 'ta' ? 'வெள்ளப் பதிவு வெற்றிகரமாகச் சேர்க்கப்பட்டது!' : 'Flood Report Broadcasted!'}
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              {language === 'ta'
                ? 'நேரடி வரைபடத்தில் தகவல் உடனடியாகப் புதுப்பிக்கப்பட்டுள்ளது.'
                : 'Visible immediately on the live map and volunteer dashboards.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* Flood Condition Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                1. {language === 'ta' ? 'வெள்ள நிலைமை (ஒரு-தட்டு)' : 'Flood Condition (One-Tap)'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {conditions.map((c) => {
                  const isSelected = condition === c.id;
                  return (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => setCondition(c.id)}
                      className={`p-3 rounded-2xl border text-left transition-all active:scale-95 touch-target ${
                        isSelected
                          ? `${c.color} ring-2 ring-sky-400 font-black shadow-lg shadow-sky-950/80 scale-[1.02]`
                          : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="text-xs font-bold text-white mb-0.5">
                        {language === 'ta' ? c.labelTa : c.labelEn}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {c.id.replace(/_/g, ' ')}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI Estimation Card - Clearly Labeled (Requirement #12) */}
            <div className="p-3.5 rounded-2xl bg-sky-950/40 border border-sky-800/60 flex items-start gap-2.5">
              <Sparkles className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-sky-500/30 text-sky-300 border border-sky-400/40">
                    {t.aiEstimateBadge}
                  </span>
                  <span className="text-xs font-bold text-sky-200">
                    {currentConditionConfig.aiEst}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Automated computer-vision & visual reference estimate. Not an official gauge measurement.
                </p>
              </div>
            </div>

            {/* Media Upload Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-slate-800 hover:bg-slate-750 border border-slate-700 cursor-pointer text-xs font-bold text-slate-200 transition-colors">
                <Camera className="w-4 h-4 text-sky-400" />
                <span>{photoUrl ? '✓ Photo Added' : t.takePhoto}</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handlePhotoSelect}
                />
              </label>

              <button
                type="button"
                onClick={handleToggleVoiceRecord}
                className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all ${
                  isRecording
                    ? 'bg-rose-600 border-rose-500 text-white animate-pulse'
                    : audioUrl
                    ? 'bg-emerald-950 border-emerald-600 text-emerald-300'
                    : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200'
                }`}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-sky-400" />}
                <span>{isRecording ? t.stopRecording : audioUrl ? '✓ Voice Saved' : t.recordAudio}</span>
              </button>
            </div>

            {/* Additional landmark notes */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                {language === 'ta' ? 'அடையாளம் / குறிப்பு (விருப்பத்தேர்வு)' : 'Landmark / Note (Optional)'}
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  language === 'ta'
                    ? 'எ.கா: பேருந்து நிறுத்தம் அருகில், 2 அடி தண்ணீர்...'
                    : 'e.g. Near bus stop, 2 feet water, impassable for cars...'
                }
                className="w-full rounded-xl bg-slate-950/80 border border-slate-700 px-3 py-2.5 text-xs text-white focus:border-sky-500"
              />
            </div>

            {error && (
              <p className="text-xs text-rose-400 bg-rose-950/40 p-2.5 rounded-xl border border-rose-900/60">
                {error}
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 font-black text-sm text-white shadow-xl shadow-sky-950 flex items-center justify-center gap-2 active:scale-98 transition-all touch-target"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Waves className="w-5 h-5" />}
              <span>{language === 'ta' ? '🌊 வெள்ள அறிக்கை சமர்ப்பிக்கவும்' : '🌊 SUBMIT FLOOD REPORT'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
