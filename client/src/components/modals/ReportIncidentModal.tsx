import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.js';
import { api } from '../../services/api.js';
import { IncidentType, SeverityLevel } from '../../types/index.js';
import {
  Flame,
  Wind,
  Car,
  Zap,
  Building,
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

interface ReportIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ReportIncidentModal: React.FC<ReportIncidentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user, profile, currentArea, coords, t, language } = useAuth();

  const [type, setType] = useState<IncidentType>('ROAD_BLOCK');
  const [severity, setSeverity] = useState<SeverityLevel>('HIGH');
  const [description, setDescription] = useState('');
  const [numberAffected, setNumberAffected] = useState(5);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const incidentTypes: { id: IncidentType; labelTa: string; labelEn: string; icon: any }[] = [
    { id: 'FIRE', labelTa: 'தீ விபத்து', labelEn: 'Fire', icon: Flame },
    { id: 'CYCLONE', labelTa: 'புயல் சேதம்', labelEn: 'Cyclone / Wind', icon: Wind },
    { id: 'ROAD_BLOCK', labelTa: 'சாலை அடைப்பு', labelEn: 'Road Block / Tree Fall', icon: Car },
    { id: 'POWER_ISSUE', labelTa: 'மின் தடை / கேபிள்', labelEn: 'Power Emergency', icon: Zap },
    { id: 'BUILDING_DAMAGE', labelTa: 'கட்டட சேதம்', labelEn: 'Building Damage', icon: Building },
    { id: 'MISSING_PERSON', labelTa: 'காணாமல் போனவர்', labelEn: 'Missing Person', icon: UserX },
    { id: 'EMERGENCY', labelTa: 'பொது அவசரம்', labelEn: 'General Emergency', icon: AlertTriangle },
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
            const res = await api.uploadFile(blob, 'incident-voice.webm');
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
        setError('Microphone access denied. You can proceed without audio.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please provide a short description.');
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      reporter_id: user?.id || 'user-citizen-1',
      reporter_name: profile?.name || 'Citizen Reporter',
      reporter_phone: profile?.mobile_number || '',
      type,
      severity,
      description,
      area: currentArea,
      latitude: coords.latitude,
      longitude: coords.longitude,
      number_affected: Number(numberAffected),
      photo_url: photoUrl,
      audio_url: audioUrl,
      is_demo: 1
    };

    try {
      if (!navigator.onLine) {
        offlineManager.enqueue('INCIDENT', payload);
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 1500);
        return;
      }

      await api.createIncident(payload);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to submit incident');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-cyber-panel border border-cyber-amber/50 p-5 sm:p-7 shadow-xl shadow-amber-950/40 relative my-auto">
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyber-amber"></div>
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyber-amber"></div>

        <div className="flex items-center justify-between pb-3 border-b border-cyber-border font-mono">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-cyber-amber/20 text-cyber-amber flex items-center justify-center border border-cyber-amber/40">
              <AlertTriangle className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-mono font-bold text-white uppercase">
                {language === 'ta' ? 'பேரிடர் / விபத்து பதிவு' : 'TRANSMIT INCIDENT TELEMETRY'}
              </h3>
              <p className="text-xs font-mono text-slate-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-cyber-amber" />
                SECTOR: {currentArea} (GPS ENCRYPTED)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="py-12 flex flex-col items-center justify-center text-center font-mono">
            <CheckCircle2 className="w-16 h-16 text-cyber-green animate-bounce mb-3 glow-text-green" />
            <h4 className="text-lg font-bold text-white uppercase">
              {language === 'ta' ? 'பேரிடர் அறிக்கை அனுப்பப்பட்டது!' : 'TELEMETRY BROADCASTED!'}
            </h4>
            <p className="text-xs text-slate-400 font-sans mt-1 max-w-xs">
              {language === 'ta'
                ? 'அதிகாரிகள் மற்றும் தன்னார்வலர்களின் நேரடி வரைபடத்தில் இது உடனடியாகத் தோன்றும்.'
                : 'Visible immediately on the tactical GIS grid and central control dashboard.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4 font-mono">
            {/* Type selector */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                1. {language === 'ta' ? 'பேரிடர் வகை (ஒரு-தட்டு)' : 'INCIDENT VECTOR'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {incidentTypes.map((tItem) => {
                  const Icon = tItem.icon;
                  const isSelected = type === tItem.id;
                  return (
                    <button
                      type="button"
                      key={tItem.id}
                      onClick={() => setType(tItem.id)}
                      className={`flex items-center gap-2 p-2 rounded text-left transition-all active:scale-95 touch-target border ${
                        isSelected
                          ? 'bg-cyber-amber text-black border-cyber-amber font-extrabold shadow-[0_0_12px_rgba(255,183,3,0.4)]'
                          : 'bg-cyber-bg border-cyber-border text-slate-300 hover:border-cyber-amber/50'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="text-xs leading-tight">
                        {language === 'ta' ? tItem.labelTa : tItem.labelEn}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Severity */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                2. {language === 'ta' ? 'தீவிரம்' : 'CRISIS SEVERITY LEVEL'}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as SeverityLevel[]).map((lvl) => (
                  <button
                    type="button"
                    key={lvl}
                    onClick={() => setSeverity(lvl)}
                    className={`py-2 rounded text-xs font-bold border transition-all ${
                      severity === lvl
                        ? lvl === 'CRITICAL'
                          ? 'bg-cyber-red text-white border-cyber-red shadow-neon-red font-black'
                          : 'bg-cyber-amber text-black border-cyber-amber font-black shadow-[0_0_10px_rgba(255,183,3,0.4)]'
                        : 'bg-cyber-bg border-cyber-border text-slate-400 hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                3. {language === 'ta' ? 'விவரம்' : 'FIELD OBSERVATION REMARKS'}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={2}
                placeholder={
                  language === 'ta'
                    ? 'எ.கா: மின் கம்பி அறுந்து விழுந்துள்ளது, மரம் முறிந்து சாலை அடைப்பு...'
                    : 'e.g. Fallen transformer cables on road, tree fallen near subway blocking transit...'
                }
                className="w-full rounded bg-cyber-bg border border-cyber-border p-3 text-xs text-white placeholder-slate-500 font-sans focus:border-cyber-amber outline-none"
              />
            </div>

            {/* Photo & Audio */}
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center justify-center gap-2 p-2.5 rounded bg-cyber-bg hover:bg-cyber-panel border border-cyber-border cursor-pointer text-xs font-bold text-slate-200 transition-colors">
                <Camera className="w-4 h-4 text-cyber-amber" />
                <span>{photoUrl ? '✓ OPTICAL CAPTURED' : t.takePhoto}</span>
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
                className={`flex items-center justify-center gap-2 p-2.5 rounded border text-xs font-bold transition-all ${
                  isRecording
                    ? 'bg-cyber-red text-white border-cyber-red animate-pulse'
                    : audioUrl
                    ? 'bg-cyber-green/20 border-cyber-green text-cyber-green'
                    : 'bg-cyber-bg hover:bg-cyber-panel border-cyber-border text-slate-200'
                }`}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-cyber-amber" />}
                <span>{isRecording ? t.stopRecording : audioUrl ? '✓ AUDIO SAVED' : t.recordAudio}</span>
              </button>
            </div>

            {error && (
              <p className="text-xs text-cyber-red bg-cyber-red/10 p-2.5 rounded border border-cyber-red/40 font-mono">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded bg-cyber-amber text-black hover:brightness-110 font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(255,183,3,0.35)] flex items-center justify-center gap-2 active:scale-98 transition-all touch-target"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : <AlertTriangle className="w-4 h-4" />}
              <span>{language === 'ta' ? 'அறிக்கையை சமர்ப்பிக்கவும்' : 'BROADCAST INCIDENT TO HQ'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
