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

  const categories: { id: HelpCategory; labelTa: string; labelEn: string; icon: any }[] = [
    { id: 'MEDICAL', labelTa: 'மருத்துவம்', labelEn: 'Medical', icon: HeartPulse },
    { id: 'AMBULANCE', labelTa: 'ஆம்புலன்ஸ்', labelEn: 'Ambulance', icon: Ambulance },
    { id: 'RESCUE', labelTa: 'மீட்புப் படகு', labelEn: 'Rescue Boat', icon: LifeBuoy },
    { id: 'FOOD', labelTa: 'உணவு', labelEn: 'Food Packs', icon: Utensils },
    { id: 'WATER', labelTa: 'குடிநீர்', labelEn: 'Drinking Water', icon: Droplet },
    { id: 'SHELTER', labelTa: 'தங்குமிடம்', labelEn: 'Shelter', icon: Home },
    { id: 'ELDERLY', labelTa: 'முதியோர் உதவி', labelEn: 'Elderly Aid', icon: UserCheck },
    { id: 'CHILD', labelTa: 'குழந்தைகள்', labelEn: 'Child Care', icon: Baby },
    { id: 'DISABILITY', labelTa: 'மாற்றுத்திறனாளி', labelEn: 'Disability Aid', icon: Accessibility },
    { id: 'TRANSPORT', labelTa: 'போக்குவரத்து', labelEn: 'Transport', icon: Car },
    { id: 'POWER', labelTa: 'மின்சாரம்', labelEn: 'Power/Charge', icon: Zap },
    { id: 'OTHER', labelTa: 'மற்றவை', labelEn: 'Other Help', icon: AlertTriangle },
  ];

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
            const res = await api.uploadFile(blob, 'help-voice.webm');
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
        setError('Microphone access unavailable.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      category,
      severity,
      description: description.trim() || `${category} emergency requested in ${currentArea}`,
      contact_phone: phone,
      latitude: coords.latitude,
      longitude: coords.longitude,
      area: currentArea,
      photo_url: photoUrl || undefined,
      audio_url: audioUrl || undefined
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 p-5 sm:p-6 shadow-2xl relative my-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600/30 text-red-400 flex items-center justify-center border border-red-500/40">
              <LifeBuoy className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {language === 'ta' ? 'அவசர உதவி கோரல்' : 'Request Emergency Help (SOS)'}
              </h3>
              <p className="text-xs text-slate-300 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-red-400" />
                {currentArea}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-3" />
            <h4 className="text-lg font-bold text-white">
              {language === 'ta' ? 'உதவி கோரிக்கை அனுப்பப்பட்டது!' : 'Help Request Sent Successfully!'}
            </h4>
            <p className="text-xs text-slate-300 mt-1 max-w-xs">
              {language === 'ta'
                ? 'அருகிலுள்ள மீட்புக் குழுவினருக்கு தகவல் தெரிவிக்கப்பட்டுள்ளது.'
                : 'Nearby rescue volunteers and relief teams have been notified.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* Category selection */}
            <div>
              <label className="block text-xs font-bold text-slate-200 uppercase mb-2">
                1. {language === 'ta' ? 'தேவையான உதவி வகை' : 'Select What You Need'}
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
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl text-center transition-all border ${
                        isSelected
                          ? 'bg-red-600 text-white border-red-500 font-bold shadow-md'
                          : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700/80'
                      }`}
                    >
                      <Icon className="w-5 h-5 mb-1" />
                      <span className="text-[11px] leading-tight">
                        {language === 'ta' ? c.labelTa : c.labelEn}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Priority Level */}
            <div>
              <label className="block text-xs font-bold text-slate-200 uppercase mb-2">
                2. {language === 'ta' ? 'அவசர நிலை' : 'Urgency Level'}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as SeverityLevel[]).map((lvl) => (
                  <button
                    type="button"
                    key={lvl}
                    onClick={() => setSeverity(lvl)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      severity === lvl
                        ? lvl === 'CRITICAL'
                          ? 'bg-red-600 text-white border-red-500'
                          : lvl === 'HIGH'
                          ? 'bg-amber-600 text-white border-amber-500'
                          : 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Description & Address */}
            <div>
              <label className="block text-xs font-bold text-slate-200 uppercase mb-1.5">
                3. {language === 'ta' ? 'விவரம் அல்லது முகவரி' : 'Description / Address'}
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  language === 'ta'
                    ? 'எ.கா: 3 பேர் வீட்டில் சிக்கியுள்ளனர், 1 முதியவர் உள்ளனர், கதவு எண் 12...'
                    : 'e.g. 3 people stranded on first floor, includes 1 senior citizen, Door No 12...'
                }
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white placeholder-slate-400 focus:border-red-500 outline-none"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold text-slate-200 uppercase mb-1.5">
                4. {language === 'ta' ? 'தொடர்பு எண்' : 'Contact Phone Number'}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white focus:border-red-500 outline-none"
              />
            </div>

            {/* Optional Photo or Voice Record */}
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 cursor-pointer text-xs font-semibold text-slate-200 transition-colors">
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
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  isRecording
                    ? 'bg-red-600 text-white border-red-500 animate-pulse'
                    : audioUrl
                    ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                }`}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-emerald-400" />}
                <span>{isRecording ? t.stopRecording : audioUrl ? '✓ Voice Saved' : t.recordAudio}</span>
              </button>
            </div>

            {error && (
              <p className="text-xs text-red-300 bg-red-950/60 p-2.5 rounded-xl border border-red-700/60">
                {error}
              </p>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LifeBuoy className="w-5 h-5" />}
              <span>{language === 'ta' ? 'அவசர உதவி கோரிக்கையை அனுப்புக' : 'Send Emergency Help (SOS)'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
