import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.js';
import { voiceService, RecognizedResult, VoiceIntent } from '../../services/speech.js';
import { Mic, MicOff, Volume2, Check, X, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api.js';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerHelp?: () => void;
  onTriggerFlood?: () => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  onTriggerHelp,
  onTriggerFlood
}) => {
  const { language, user, profile, currentArea, t } = useAuth();
  const navigate = useNavigate();

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [detectedIntent, setDetectedIntent] = useState<VoiceIntent | null>(null);
  const [confirmingIntent, setConfirmingIntent] = useState<VoiceIntent | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleStartListening = () => {
    setErrorMessage(null);
    setTranscript('');
    setDetectedIntent(null);
    setConfirmingIntent(null);
    setIsListening(true);

    voiceService.startListening(
      language,
      (result: RecognizedResult) => {
        setIsListening(false);
        setTranscript(result.transcript);
        setDetectedIntent(result.intent);
        handleIntent(result.intent, result.transcript);
      },
      (err: any) => {
        setIsListening(false);
        console.warn('Speech recognition error:', err);
        setErrorMessage(
          language === 'ta'
            ? 'குரலைக் கேட்க முடியவில்லை. தயவுசெய்து மீண்டும் பேசவும் அல்லது கீழே உள்ள பொத்தான்களைப் பயன்படுத்தவும்.'
            : 'Could not capture voice. Please try again or tap the emergency buttons.'
        );
      }
    );
  };

  const handleIntent = (intent: VoiceIntent, capturedText: string) => {
    if (intent === 'REQUEST_HELP') {
      const responseVoice = language === 'ta'
        ? 'மருத்துவ உதவி கேட்கவா? உறுதிப்படுத்தவும்.'
        : 'Do you want to request emergency help? Please confirm.';
      voiceService.speak(responseVoice, language);
      setConfirmingIntent('REQUEST_HELP');
    } else if (intent === 'REPORT_FLOOD') {
      const responseVoice = language === 'ta'
        ? 'வெள்ளப் பாதிப்பு பதிவு செய்யவா?'
        : 'Do you want to report flood water level?';
      voiceService.speak(responseVoice, language);
      setConfirmingIntent('REPORT_FLOOD');
    } else if (intent === 'SAFETY_CHECK') {
      const responseVoice = language === 'ta'
        ? 'நீங்கள் பாதுகாப்பாக இருக்கிறீர்கள் என்று பதிவு செய்யவா?'
        : 'Confirm that you are safe?';
      voiceService.speak(responseVoice, language);
      setConfirmingIntent('SAFETY_CHECK');
    } else if (intent === 'FIND_SHELTER') {
      const responseVoice = language === 'ta'
        ? 'பாதுகாப்பான நிவாரண முகாம்களைக் காட்டுகிறேன்.'
        : 'Showing nearby emergency shelters.';
      voiceService.speak(responseVoice, language);
      setTimeout(() => {
        onClose();
        navigate('/map');
      }, 1000);
    } else if (intent === 'FIND_RESOURCE') {
      const responseVoice = language === 'ta'
        ? 'நிவாரணப் பொருட்கள் பட்டியலைக் காட்டுகிறேன்.'
        : 'Opening community resources.';
      voiceService.speak(responseVoice, language);
      setTimeout(() => {
        onClose();
        navigate('/help');
      }, 1000);
    } else {
      const responseVoice = language === 'ta'
        ? 'புரிந்துகொள்ள முடியவில்லை. தயவுசெய்து உதவி அல்லது வெள்ளம் என்று சொல்லவும்.'
        : 'Please say "Help", "Report Flood", or "I am safe".';
      voiceService.speak(responseVoice, language);
    }
  };

  const handleConfirmAction = async () => {
    setIsProcessing(true);
    try {
      if (confirmingIntent === 'SAFETY_CHECK') {
        await api.submitSafetyCheckin({
          user_id: user?.id || 'user-citizen-1',
          user_name: profile?.name || 'Citizen',
          user_phone: profile?.mobile_number || '+91 98765 43210',
          status: 'SAFE',
          area: currentArea,
          note: `Voice check-in: ${transcript}`
        });

        const successSpeech = language === 'ta'
          ? 'நீங்கள் பாதுகாப்பாக உள்ளீர்கள் என்று பதிவு செய்யப்பட்டது.'
          : 'Your safety status has been updated to Safe.';
        voiceService.speak(successSpeech, language);

        setTimeout(() => {
          setIsProcessing(false);
          onClose();
        }, 1200);
      } else if (confirmingIntent === 'REQUEST_HELP') {
        onClose();
        if (onTriggerHelp) onTriggerHelp();
        else navigate('/help');
      } else if (confirmingIntent === 'REPORT_FLOOD') {
        onClose();
        if (onTriggerFlood) onTriggerFlood();
      }
    } catch (e: any) {
      setErrorMessage(e.message);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl flex flex-col items-center text-center">
        {/* Close Button */}
        <div className="w-full flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
            <Volume2 className="w-4 h-4" />
            {language === 'ta' ? 'குரல் உதவியாளர்' : 'Voice Assistant'}
          </span>
          <button
            onClick={() => {
              voiceService.stopListening();
              onClose();
            }}
            className="p-1 rounded-xl text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Instructions */}
        <h3 className="text-lg font-extrabold text-white mt-2">
          {language === 'ta' ? 'பேசி உதவி பெறவும்' : 'Speak to Get Help'}
        </h3>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          {language === 'ta'
            ? 'உதாரணம்: "எனக்கு உதவி வேண்டும்", "வெள்ளம் இருக்கு", "நான் பாதுகாப்பாக இருக்கிறேன்"'
            : 'Example: "I need help", "Flood on road", "I am safe", "Find shelter"'}
        </p>

        {/* Large Central Microphone Button */}
        <div className="my-8 relative flex items-center justify-center">
          {isListening && (
            <div className="absolute w-36 h-36 rounded-full bg-rose-600/30 animate-ping-slow pointer-events-none" />
          )}
          <button
            onClick={isListening ? () => voiceService.stopListening() : handleStartListening}
            className={`w-28 h-28 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all duration-300 active:scale-95 touch-target ${
              isListening
                ? 'bg-rose-600 text-white shadow-rose-900/60 ring-8 ring-rose-500/30'
                : 'bg-gradient-to-tr from-rose-600 to-rose-500 text-white hover:brightness-110 shadow-rose-950/80'
            }`}
          >
            {isListening ? (
              <MicOff className="w-10 h-10 animate-pulse" />
            ) : (
              <Mic className="w-10 h-10" />
            )}
            <span className="text-[11px] font-bold mt-1 tracking-tight">
              {isListening ? (language === 'ta' ? 'கேட்கிறது...' : 'Listening...') : (language === 'ta' ? 'பேசுங்கள்' : 'Tap to Speak')}
            </span>
          </button>
        </div>

        {/* Live Transcript Display */}
        {transcript && (
          <div className="w-full p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-left mb-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              {language === 'ta' ? 'நீங்கள் கூறியது:' : 'You said:'}
            </span>
            <p className="text-sm font-semibold text-slate-100 mt-1">
              "{transcript}"
            </p>
          </div>
        )}

        {/* Confirmation Flow for Voice Actions (Requirement #24) */}
        {confirmingIntent && (
          <div className="w-full p-4 rounded-2xl bg-rose-950/40 border border-rose-800/80 text-center mb-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-center gap-1.5 text-rose-400 font-bold text-xs uppercase mb-1">
              <AlertCircle className="w-4 h-4" />
              {t.confirmHelpTitle}
            </div>
            <p className="text-sm font-extrabold text-white mb-3">
              {confirmingIntent === 'REQUEST_HELP' && (language === 'ta' ? 'அவசர உதவி கோரவா?' : 'Submit Emergency Help Request?')}
              {confirmingIntent === 'REPORT_FLOOD' && (language === 'ta' ? 'வெள்ளப் பதிவு தொடங்கவா?' : 'Open Flood Report Form?')}
              {confirmingIntent === 'SAFETY_CHECK' && (language === 'ta' ? 'பாதுகாப்பாக உள்ளீர்கள் என்று பதிவு செய்யவா?' : 'Mark your status as SAFE?')}
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                disabled={isProcessing}
                onClick={handleConfirmAction}
                className="py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-extrabold text-xs text-white flex items-center justify-center gap-1 shadow-lg shadow-emerald-950"
              >
                <Check className="w-4 h-4 stroke-[3px]" />
                {t.yesConfirm}
              </button>
              <button
                onClick={() => setConfirmingIntent(null)}
                className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-xs text-slate-300 flex items-center justify-center gap-1"
              >
                <X className="w-4 h-4 stroke-[3px]" />
                {t.noCancel}
              </button>
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <p className="text-xs text-amber-400 mb-4 bg-amber-950/30 p-2.5 rounded-xl border border-amber-900/50">
            {errorMessage}
          </p>
        )}

        {/* Language Indicator */}
        <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
          <span>Active Language:</span>
          <span className="font-bold text-slate-400">{language === 'ta' ? 'தமிழ் (Tamil)' : 'English'}</span>
        </div>
      </div>
    </div>
  );
};
