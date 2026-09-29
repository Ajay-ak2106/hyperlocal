import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.js';
import { api } from '../../services/api.js';
import { HelpCategory, SeverityLevel } from '../../types/index.js';
import {
  HeartPulse,
  Ambulance,
  LifeBuoy,
  Utensils,
  Droplet,
  Home,
  UserCheck,
  Baby,
  Accessibility,
  Car,
  Zap,
  PhoneCall,
  UserX,
  AlertTriangle,
  Camera,
  Mic,
  MicOff,
  MapPin,
  X,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { offlineManager } from '../../services/offline.js';

interface RequestHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const RequestHelpModal: React.FC<RequestHelpModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user, profile, currentArea, coords, t, language } = useAuth();

  const [category, setCategory] = useState<HelpCategory>('MEDICAL');
  const [severity, setSeverity] = useState<SeverityLevel>('HIGH');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState(profile?.mobile_number || '+91 98765 43210');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const categories: { id: HelpCategory; labelTa: string; labelEn: string; icon: any; color: string }[] = [
    { id: 'MEDICAL', labelTa: 'மருத்துவம்', labelEn: 'Medical', icon: HeartPulse, color: 'border-rose-500 bg-rose-500/20 text-rose-300' },
    { id: 'AMBULANCE', labelTa: 'ஆம்புலன்ஸ்', labelEn: 'Ambulance', icon: Ambulance, color: 'border-red-500 bg-red-500/20 text-red-300' },
    { id: 'RESCUE', labelTa: 'மீட்புப் பணி', labelEn: 'Rescue Boat', icon: LifeBuoy, color: 'border-sky-500 bg-sky-500/20 text-sky-300' },
    { id: 'FOOD', labelTa: 'உணவு', labelEn: 'Food Packs', icon: Utensils, color: 'border-amber-500 bg-amber-500/20 text-amber-300' },
    { id: 'WATER', labelTa: 'குடிநீர்', labelEn: 'Drinking Water', icon: Droplet, color: 'border-blue-500 bg-blue-500/20 text-blue-300' },
    { id: 'SHELTER', labelTa: 'தங்குமிடம்', labelEn: 'Shelter', icon: Home, color: 'border-emerald-500 bg-emerald-500/20 text-emerald-300' },
    { id: 'ELDERLY', labelTa: 'முதியோர் உதவி', labelEn: 'Elderly Aid', icon: UserCheck, color: 'border-purple-500 bg-purple-500/20 text-purple-300' },
    { id: 'CHILD', labelTa: 'குழந்தைகள்', labelEn: 'Child Care', icon: Baby, color: 'border-pink-500 bg-pink-500/20 text-pink-300' },
    { id: 'DISABILITY', labelTa: 'மாற்றுத்திறனாளி', labelEn: 'Disability Aid', icon: Accessibility, color: 'border-indigo-500 bg-indigo-500/20 text-indigo-300' },
    { id: 'TRANSPORT', labelTa: 'போக்குவரத்து', labelEn: 'Transport', icon: Car, color: 'border-cyan-500 bg-cyan-500/20 text-cyan-300' },
    { id: 'POWER', labelTa: 'மின்சாரம்', labelEn: 'Power/Charge', icon: Zap, color: 'border-yellow-500 bg-yellow-500/20 text-yellow-300' },
    { id: 'MISSING_PERSON', labelTa: 'காணாமல் போனவர்', labelEn: 'Missing Person', icon: UserX, color: 'border-orange-500 bg-orange-500/20 text-orange-300' },
    { id: 'OTHER', labelTa: 'மற்றவை', labelEn: 'Other Emergency', icon: AlertTriangle, color: 'border-slate-500 bg-slate-500/20 text-slate-300' },
  ];

  // Photo upload handler
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

  // Voice recording handler
  const handleToggleVoiceRecord = async () => {
    if (isRecording) {
      if (mediaRecorder) {
        mediaRecorder.stop();
      }
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
            const res = await api.uploadFile(blob, 'voice-request.webm');
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
        console.warn('Microphone permission denied or not available:', err);
        setError('Could not access microphone. You can type or submit without audio.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload = {
      citizen_id: user?.id || 'user-citizen-1',
      citizen_name: profile?.name || 'Citizen in Need',
      citizen_phone: phone,
      category,
      severity,
      description: description || `${category} emergency assistance requested in ${currentArea}`,
      area: currentArea,
      latitude: coords.latitude,
      longitude: coords.longitude,
      photo_url: photoUrl,
      audio_url: audioUrl,
      is_demo: 1
    };

    try {
      if (!navigator.onLine) {
        offlineManager.enqueue('ASSISTANCE', payload);
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 1500);
        return;
      }

      await api.createAssistanceRequest(payload);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700/80 p-5 sm:p-7 shadow-2xl relative my-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                {language === 'ta' ? 'அவசர உதவி கோரல்' : 'Request Emergency Assistance'}
              </h3>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                {currentArea}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-xl text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 animate-bounce mb-3" />
            <h4 className="text-lg font-extrabold text-white">
              {language === 'ta' ? 'உதவி கோரிக்கை அனுப்பப்பட்டது!' : 'Assistance Request Broadcasted!'}
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              {language === 'ta'
                ? 'அருகிலுள்ள தன்னார்வலர்களுக்கு தகவல் அனுப்பப்பட்டுள்ளது. உடனடி உதவி ஒருங்கிணைக்கப்படுகிறது.'
                : 'Nearby volunteers and disaster coordinators have been notified in real time.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* 1-Tap Category Grid */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                1. {language === 'ta' ? 'தேவையான உதவி வகை (1-தட்டு)' : 'Category of Assistance (One-Tap)'}
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {categories.map((c) => {
                  const Icon = c.icon;
                  const isSelected = category === c.id;
                  return (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => setCategory(c.id)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all active:scale-95 touch-target ${
                        isSelected
                          ? `${c.color} ring-2 ring-rose-500 font-black shadow-lg shadow-rose-950/60 scale-[1.03]`
                          : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-6 h-6 mb-1" />
                      <span className="text-[11px] text-center font-bold leading-tight">
                        {language === 'ta' ? c.labelTa : c.labelEn}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Severity Pill Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                2. {language === 'ta' ? 'அவசர நிலை' : 'Urgency Level'}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as SeverityLevel[]).map((lvl) => (
                  <button
                    type="button"
                    key={lvl}
                    onClick={() => setSeverity(lvl)}
                    className={`py-2 rounded-xl text-xs font-extrabold border transition-all ${
                      severity === lvl
                        ? lvl === 'CRITICAL'
                          ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-950'
                          : lvl === 'HIGH'
                          ? 'bg-amber-600 border-amber-500 text-white'
                          : 'bg-emerald-600 border-emerald-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Short Description */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                3. {language === 'ta' ? 'குறுகிய விவரம்' : 'Short Description (Optional)'}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder={
                  language === 'ta'
                    ? 'எடுத்துக்காட்டு: முதியவருக்கு அவசர மருந்து தேவை, முதல் தளம்...'
                    : 'e.g. Elderly patient needs oxygen, trapped on 1st floor...'
                }
                className="w-full rounded-2xl bg-slate-950/80 border border-slate-700 p-3 text-xs text-white placeholder-slate-500 focus:border-rose-500"
              />
            </div>

            {/* Quick Media Attach: Photo & Voice Note */}
            <div className="grid grid-cols-2 gap-2">
              {/* Photo Input */}
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

              {/* Voice Record */}
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
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-rose-400" />}
                <span>{isRecording ? t.stopRecording : audioUrl ? '✓ Voice Saved' : t.recordAudio}</span>
              </button>
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                {language === 'ta' ? 'தொடர்பு எண்' : 'Callback Phone Number'}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full rounded-xl bg-slate-950/80 border border-slate-700 px-3 py-2 text-xs text-white focus:border-rose-500 font-mono"
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
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 font-black text-sm text-white shadow-xl shadow-rose-950 flex items-center justify-center gap-2 active:scale-98 transition-all touch-target"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LifeBuoy className="w-5 h-5" />}
              <span>{language === 'ta' ? '🆘 அவசர உதவி கோரவும்' : '🆘 SUBMIT HELP REQUEST'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
