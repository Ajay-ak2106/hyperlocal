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
  Loader2,
  Navigation
} from 'lucide-react';
import { offlineManager } from '../../services/offline.js';
import { CHENNAI_AREAS, getAreaLocation } from '../../constants/areas.js';

interface ReportIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ReportIncidentModal: React.FC<ReportIncidentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { currentArea, coords, t, language } = useAuth();

  const [type, setType] = useState<IncidentType>('ROAD_BLOCK');
  const [severity, setSeverity] = useState<SeverityLevel>('HIGH');
  const [description, setDescription] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>(currentArea || 'Velachery');
  const [landmark, setLandmark] = useState<string>('');
  const [incidentCoords, setIncidentCoords] = useState<{ latitude: number; longitude: number }>({
    latitude: coords?.latitude || 12.9785,
    longitude: coords?.longitude || 80.2215
  });
  const [usingGps, setUsingGps] = useState(false);

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const incidentTypes: { id: IncidentType; labelTa: string; labelEn: string; icon: any }[] = [
    { id: 'ROAD_BLOCK', labelTa: 'சாலை அடைப்பு / மரம்', labelEn: 'Road Block / Tree Fall', icon: Car },
    { id: 'POWER_ISSUE', labelTa: 'மின் தடை / கேபிள்', labelEn: 'Power Cable Issue', icon: Zap },
    { id: 'FIRE', labelTa: 'தீ விபத்து', labelEn: 'Fire Incident', icon: Flame },
    { id: 'CYCLONE', labelTa: 'புயல் சேதம்', labelEn: 'Cyclone Damage', icon: Wind },
    { id: 'BUILDING_DAMAGE', labelTa: 'கட்டட சேதம்', labelEn: 'Building Damage', icon: Building },
    { id: 'MISSING_PERSON', labelTa: 'காணாமல் போனவர்', labelEn: 'Missing Person', icon: UserX },
    { id: 'EMERGENCY', labelTa: 'பொது அவசரம்', labelEn: 'General Emergency', icon: AlertTriangle },
  ];

  const handleAreaChange = (areaName: string) => {
    setSelectedArea(areaName);
    setUsingGps(false);
    if (areaName !== 'CUSTOM') {
      const loc = getAreaLocation(areaName);
      setIncidentCoords({ latitude: loc.latitude, longitude: loc.longitude });
    }
  };

  const handleUseCurrentGps = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIncidentCoords({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          });
          setUsingGps(true);
        },
        (err) => {
          alert('GPS unavailable: ' + err.message);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  };

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
        setError('Microphone access unavailable.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fullDescription = landmark.trim()
      ? `[${landmark.trim()}] ${description.trim()}`
      : description.trim();

    const payload = {
      type,
      severity,
      description: fullDescription,
      latitude: incidentCoords.latitude,
      longitude: incidentCoords.longitude,
      area: selectedArea,
      photo_url: photoUrl || undefined,
      audio_url: audioUrl || undefined
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 p-5 sm:p-6 shadow-2xl relative my-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-600/30 text-amber-400 flex items-center justify-center border border-amber-500/40">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {language === 'ta' ? 'விபத்து அல்லது ஆபத்து பதிவு' : 'Report Hazard or Incident'}
              </h3>
              <p className="text-xs text-slate-300 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>{selectedArea}</span>
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
              {language === 'ta' ? 'அறிக்கை பதிவு செய்யப்பட்டது!' : 'Incident Report Recorded!'}
            </h4>
            <p className="text-xs text-slate-300 mt-1 max-w-xs">
              {language === 'ta'
                ? `நேரலை வரைபடத்தில் ${selectedArea} பகுதியில் இந்த விவரம் சேர்க்கப்பட்டுள்ளது.`
                : `Visible immediately at ${selectedArea} on the disaster response map.`}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* 1. Incident Type */}
            <div>
              <label className="block text-xs font-bold text-slate-200 uppercase mb-2">
                1. {language === 'ta' ? 'விபத்து வகை' : 'Incident Type'}
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
                      className={`flex items-center gap-2 p-2.5 rounded-xl text-left transition-all border ${
                        isSelected
                          ? 'bg-amber-600 text-white border-amber-500 font-bold shadow-sm'
                          : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700/80'
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

            {/* 2. Select Location & Specific Locality */}
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-200 uppercase flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>2. {language === 'ta' ? 'விபத்து இடம் / பகுதி தேர்வு' : 'Select Incident Location'}</span>
                </label>

                <button
                  type="button"
                  onClick={handleUseCurrentGps}
                  className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-slate-900/80 px-2 py-1 rounded-lg border border-emerald-500/30 active:scale-95 transition-all"
                >
                  <Navigation className="w-3 h-3 text-emerald-400" />
                  <span>{language === 'ta' ? 'என் GPS இருப்பிடம்' : 'Use Current GPS'}</span>
                </button>
              </div>

              {/* Area Select Dropdown */}
              <div>
                <select
                  value={CHENNAI_AREAS.some(a => a.name === selectedArea) ? selectedArea : 'CUSTOM'}
                  onChange={(e) => handleAreaChange(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none transition-colors"
                >
                  {CHENNAI_AREAS.map((a) => (
                    <option key={a.name} value={a.name}>
                      📍 {a.name} ({a.nameTa}) — {a.zone}
                    </option>
                  ))}
                  <option value="CUSTOM">✏️ {language === 'ta' ? 'வேறு பகுதி (கீழே குறிப்பிடவும்)' : 'Other Locality (Type below)'}</option>
                </select>
              </div>

              {/* Specific Street Address / Landmark */}
              <div>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder={language === 'ta' ? 'குறிப்பிட்ட தெரு, மைல்கல் (எ.கா: 100 அடி சாலை, MRTS நிலையம் அருகில்)' : 'Specific landmark / street (e.g. 100 Feet Rd, near MRTS)'}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none placeholder-slate-400"
                />
              </div>

              {/* Coordinate indicator badge */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-0.5">
                <span>
                  Coordinates: <span className="text-slate-200 font-mono">{incidentCoords.latitude.toFixed(4)}, {incidentCoords.longitude.toFixed(4)}</span>
                </span>
                {usingGps ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> GPS Active
                  </span>
                ) : (
                  <span className="text-slate-400 text-[10px]">
                    📍 Centered on {selectedArea}
                  </span>
                )}
              </div>
            </div>

            {/* 3. Severity Level */}
            <div>
              <label className="block text-xs font-bold text-slate-200 uppercase mb-2">
                3. {language === 'ta' ? 'தீவிரம்' : 'Severity Level'}
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
                          ? 'bg-red-600 text-white border-red-500 shadow-sm'
                          : 'bg-amber-600 text-white border-amber-500 shadow-sm'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Description */}
            <div>
              <label className="block text-xs font-bold text-slate-200 uppercase mb-1.5">
                4. {language === 'ta' ? 'விவரம்' : 'Details / Remarks'}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={2}
                placeholder={
                  language === 'ta'
                    ? 'எ.கா: மரம் விழுந்து சாலை அடைக்கப்பட்டுள்ளது, மின் கம்பி அறுந்து கிடக்கிறது...'
                    : 'e.g. Tree fallen on main road blocking traffic, power lines down...'
                }
                className="w-full rounded-xl bg-slate-800 border border-slate-700 p-3 text-xs text-white placeholder-slate-400 focus:border-amber-500 outline-none"
              />
            </div>

            {/* Photo & Audio */}
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 cursor-pointer text-xs font-semibold text-slate-200 transition-colors">
                <Camera className="w-4 h-4 text-amber-400" />
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
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-amber-400" />}
                <span>{isRecording ? t.stopRecording : audioUrl ? '✓ Voice Saved' : t.recordAudio}</span>
              </button>
            </div>

            {error && (
              <p className="text-xs text-red-300 bg-red-950/60 p-2.5 rounded-xl border border-red-700/60">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <AlertTriangle className="w-5 h-5" />}
              <span>{language === 'ta' ? 'அறிக்கையை சமர்ப்பிக்கவும்' : 'Submit Incident Report'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
