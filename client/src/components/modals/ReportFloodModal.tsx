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
  Navigation
} from 'lucide-react';
import { offlineManager } from '../../services/offline.js';
import { CHENNAI_AREAS, getAreaLocation } from '../../constants/areas.js';

interface ReportFloodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ReportFloodModal: React.FC<ReportFloodModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { currentArea, coords, t, language } = useAuth();

  const [condition, setCondition] = useState<FloodCondition>('WATER_ON_ROAD');
  const [description, setDescription] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>(currentArea || 'Velachery');
  const [landmark, setLandmark] = useState<string>('');
  const [floodCoords, setFloodCoords] = useState<{ latitude: number; longitude: number }>({
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

  const conditions: { id: FloodCondition; labelTa: string; labelEn: string; est: string }[] = [
    { id: 'WATER_ON_ROAD', labelTa: 'சாலையில் தண்ணீர்', labelEn: 'Water on Road', est: 'Ankle Level (~0.5 - 1 ft)' },
    { id: 'FLOODED_STREET', labelTa: 'தெருவில் வெள்ளம்', labelEn: 'Flooded Street', est: 'Knee Level (~1.5 - 2.5 ft)' },
    { id: 'WATER_ENTERING_HOUSE', labelTa: 'வீட்டிற்குள் தண்ணீர்', labelEn: 'Water Entering House', est: 'Waist Level (~3 - 4 ft)' },
    { id: 'VEHICLES_AFFECTED', labelTa: 'வாகனங்கள் மூழ்கியது', labelEn: 'Vehicles Submerged', est: 'Tyre / Bonnet Level' },
    { id: 'ROAD_BLOCKED', labelTa: 'சாலை அடைப்பு', labelEn: 'Road Blocked / Impassable', est: 'High Risk (> 3 ft)' },
    { id: 'DANGEROUS_WATER_LEVEL', labelTa: 'ஆபத்தான நீர்மட்டம்', labelEn: 'Dangerous Water Flow', est: 'Severe Current (> 4.5 ft)' },
  ];

  const currentConditionConfig = conditions.find((c) => c.id === condition) || conditions[0];

  const handleAreaChange = (areaName: string) => {
    setSelectedArea(areaName);
    setUsingGps(false);
    if (areaName !== 'CUSTOM') {
      const loc = getAreaLocation(areaName);
      setFloodCoords({ latitude: loc.latitude, longitude: loc.longitude });
    }
  };

  const handleUseCurrentGps = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFloodCoords({
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
        setError('Microphone not accessible.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const severityMap: Record<FloodCondition, 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'> = {
      WATER_ON_ROAD: 'LOW',
      FLOODED_STREET: 'MEDIUM',
      WATER_ENTERING_HOUSE: 'HIGH',
      VEHICLES_AFFECTED: 'HIGH',
      ROAD_BLOCKED: 'HIGH',
      DANGEROUS_WATER_LEVEL: 'CRITICAL',
      OTHER: 'MEDIUM'
    };

    const details = description.trim() || `${currentConditionConfig.labelEn} reported in ${selectedArea} (${currentConditionConfig.est})`;
    const fullDesc = landmark.trim() ? `[${landmark.trim()}] ${details}` : details;

    const payload = {
      type: 'FLOOD' as const,
      severity: severityMap[condition],
      description: fullDesc,
      latitude: floodCoords.latitude,
      longitude: floodCoords.longitude,
      area: selectedArea,
      photo_url: photoUrl || undefined,
      audio_url: audioUrl || undefined
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

      await api.createIncident(payload);
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 p-5 sm:p-6 shadow-2xl relative my-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-600/30 text-sky-400 flex items-center justify-center border border-sky-500/40">
              <Waves className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {language === 'ta' ? 'வெள்ள நிலவரம் பதிவு' : 'Report Flood & Water Level'}
              </h3>
              <p className="text-xs text-slate-300 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-sky-400" />
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
            <CheckCircle2 className="w-16 h-16 text-sky-400 mb-3" />
            <h4 className="text-lg font-bold text-white">
              {language === 'ta' ? 'வெள்ள அறிக்கை பதிவு செய்யப்பட்டது!' : 'Flood Report Recorded!'}
            </h4>
            <p className="text-xs text-slate-300 mt-1 max-w-xs">
              {language === 'ta'
                ? `நேரலை வரைபடத்தில் ${selectedArea} பகுதியில் இந்த விவரம் சேர்க்கப்பட்டுள்ளது.`
                : `The live disaster map and flood dashboard for ${selectedArea} have been updated.`}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* 1. Condition selection */}
            <div>
              <label className="block text-xs font-bold text-slate-200 uppercase mb-2">
                1. {language === 'ta' ? 'வெள்ளத்தின் அளவு' : 'Water Level Condition'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {conditions.map((c) => {
                  const isSelected = condition === c.id;
                  return (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => setCondition(c.id)}
                      className={`p-3 rounded-xl text-left transition-all border ${
                        isSelected
                          ? 'bg-sky-600 text-white border-sky-500 font-bold shadow-md'
                          : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700/80'
                      }`}
                    >
                      <div className="text-xs font-semibold leading-tight">
                        {language === 'ta' ? c.labelTa : c.labelEn}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {c.est}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Select Location & Specific Locality */}
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-200 uppercase flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-sky-400" />
                  <span>2. {language === 'ta' ? 'வெள்ளப் பகுதி தேர்வு' : 'Select Flood Location'}</span>
                </label>

                <button
                  type="button"
                  onClick={handleUseCurrentGps}
                  className="text-[11px] font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 bg-slate-900/80 px-2 py-1 rounded-lg border border-sky-500/30 active:scale-95 transition-all"
                >
                  <Navigation className="w-3 h-3 text-sky-400" />
                  <span>{language === 'ta' ? 'என் GPS இருப்பிடம்' : 'Use Current GPS'}</span>
                </button>
              </div>

              {/* Area Select Dropdown */}
              <div>
                <select
                  value={CHENNAI_AREAS.some(a => a.name === selectedArea) ? selectedArea : 'CUSTOM'}
                  onChange={(e) => handleAreaChange(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white focus:border-sky-500 outline-none transition-colors"
                >
                  {CHENNAI_AREAS.map((a) => (
                    <option key={a.name} value={a.name}>
                      📍 {a.name} ({a.nameTa}) — {a.zone}
                    </option>
                  ))}
                  <option value="CUSTOM">✏️ {language === 'ta' ? 'வேறு பகுதி (கீழே குறிப்பிடவும்)' : 'Other Locality / Street'}</option>
                </select>
              </div>

              {/* Specific Street Address / Landmark */}
              <div>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder={language === 'ta' ? 'குறிப்பிட்ட தெரு, சாலை மைல்கல் (எ.கா: ராம் நகர், ஏரி பாலம் அருகில்)' : 'Specific street / landmark (e.g. Ram Nagar, Lake bridge)'}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white focus:border-sky-500 outline-none placeholder-slate-400"
                />
              </div>

              {/* Coordinate indicator badge */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-0.5">
                <span>
                  Coordinates: <span className="text-slate-200 font-mono">{floodCoords.latitude.toFixed(4)}, {floodCoords.longitude.toFixed(4)}</span>
                </span>
                {usingGps ? (
                  <span className="text-sky-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> GPS Active
                  </span>
                ) : (
                  <span className="text-slate-400 text-[10px]">
                    📍 Centered on {selectedArea}
                  </span>
                )}
              </div>
            </div>

            {/* 3. Description */}
            <div>
              <label className="block text-xs font-bold text-slate-200 uppercase mb-1.5">
                3. {language === 'ta' ? 'கூடுதல் விவரங்கள்' : 'Additional Remarks'}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder={
                  language === 'ta'
                    ? 'எ.கா: மோட்டார் பம்புகள் தேவை, தரை தள வீடுகளில் தண்ணீர் புகுந்துள்ளது...'
                    : 'e.g. Inflow from surplus canal, ground floor apartments waterlogged...'
                }
                className="w-full rounded-xl bg-slate-800 border border-slate-700 p-3 text-xs text-white placeholder-slate-400 focus:border-sky-500 outline-none"
              />
            </div>

            {/* Photo & Audio */}
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
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-sky-400" />}
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
              className="w-full py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Waves className="w-5 h-5" />}
              <span>{language === 'ta' ? 'வெள்ள அறிக்கை சமர்ப்பிக்கவும்' : 'Submit Flood Report'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
