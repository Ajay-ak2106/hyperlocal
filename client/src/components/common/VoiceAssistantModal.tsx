import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.js';
import { voiceService, RecognizedResult, VoiceIntent } from '../../services/speech.js';
import { Mic, MicOff, Volume2, Check, X, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api.js';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerFlood?: () => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
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
        console.warn('Speech recognition:', err);
        setErrorMessage(
          language === 'ta'
            ? 'குரலைக் கேட்க முடியவில்லை. தயவுசெய்து மீண்டும் பேசவும் அல்லது திரையிலுள்ள பொத்தான்களைப் பயன்படுத்தவும்.'
            : 'Could not capture voice clearly. Please try again or tap the buttons.'
        );
      }
    );
  };

  const handleIntent = (intent: VoiceIntent, capturedText: string) => {
    if (intent === 'REQUEST_HELP') {
      const responseVoice = language === 'ta'
        ? 'மருத்துவ அல்லது மீட்பு உதவி கேட்கவா?'
        : 'Do you want to request emergency help?';
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
        : 'Showing nearby shelters.';
      voiceService.speak(responseVoice, language);
      setTimeout(() => {
        onClose();
        navigate('/shelters');
      }, 1000);
    } else if (intent === 'FIND_RESOURCE') {
      const responseVoice = language === 'ta'
        ? 'நிவாரணப் பொருட்கள் பட்டியலைக் காட்டுகிறேன்.'
        : 'Opening resources.';
      voiceService.speak(responseVoice, language);
      setTimeout(() => {
        onClose();
        navigate('/resources');
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl flex flex-col items-center text-center relative">
        {/* Header */}
        <div className="w-full flex justify-between items-center mb-2 pb-2 border-b border-slate-800">
          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-emerald-400" />
            {language === 'ta' ? 'குரல் வழி உதவி' : 'Voice Assistant'}
          </span>
          <button
            onClick={() => {
              voiceService.stopListening();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Instructions */}
        <h3 className="text-base font-bold text-white mt-2">
          {language === 'ta' ? 'பேசி உதவி பெறவும்' : 'Speak to Access Assistance'}
        </h3>
        <p className="text-xs text-slate-300 mt-1 max-w-xs leading-relaxed">
          {language === 'ta'
            ? 'உதாரணம்: "உதவி வேண்டும்", "வெள்ளம்", "நான் பாதுகாப்பாக உள்ளேன்"'
            : 'Try saying: "Help", "Report Flood", "I am safe", or "Find Shelter"'}
        </p>

        {/* Central Mic Button */}
        <div className="my-6 relative flex items-center justify-center">
          {isListening && (
            <div className="absolute w-32 h-32 rounded-full border border-emerald-400/50 bg-emerald-500/10 animate-ping pointer-events-none" />
          )}
          <button
            onClick={isListening ? () => voiceService.stopListening() : handleStartListening}
            className={`w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all duration-200 active:scale-95 shadow-lg ${
              isListening
                ? 'bg-emerald-600 text-white ring-4 ring-emerald-400/30'
                : 'bg-slate-800 hover:bg-slate-700 border-2 border-emerald-500 text-emerald-400'
            }`}
          >
            {isListening ? (
              <MicOff className="w-8 h-8 animate-pulse text-white" />
            ) : (
              <Mic className="w-8 h-8 text-emerald-400" />
            )}
            <span className="text-[11px] font-bold mt-1">
              {isListening
                ? (language === 'ta' ? 'கேட்கிறது...' : 'Listening...')
                : (language === 'ta' ? 'தட்டவும்' : 'Tap to Speak')}
            </span>
          </button>
        </div>

        {/* Transcript */}
        {transcript && (
          <div className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-left mb-3">
            <span className="text-[10px] font-bold text-emerald-400 uppercase block">
              {language === 'ta' ? 'நீங்கள் கூறியது:' : 'Heard:'}
            </span>
            <p className="text-xs text-white mt-0.5">
              "{transcript}"
            </p>
          </div>
        )}

        {/* Confirmation */}
        {confirmingIntent && (
          <div className="w-full p-4 rounded-xl bg-slate-800 border border-slate-700 text-center mb-3">
            <p className="text-xs font-bold text-white mb-3">
              {confirmingIntent === 'REQUEST_HELP' && (language === 'ta' ? 'அவசர உதவி கோரவா?' : 'Open Emergency Help (SOS)?')}
              {confirmingIntent === 'REPORT_FLOOD' && (language === 'ta' ? 'வெள்ளப் பதிவு தொடங்கவா?' : 'Open Flood Report Form?')}
              {confirmingIntent === 'SAFETY_CHECK' && (language === 'ta' ? 'பாதுகாப்பாக உள்ளீர்கள் என்று பதிவு செய்யவா?' : 'Confirm You Are Safe?')}
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                disabled={isProcessing}
                onClick={handleConfirmAction}
                className="py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1 hover:bg-emerald-500"
              >
                <Check className="w-4 h-4" />
                {t.yesConfirm}
              </button>
              <button
                onClick={() => setConfirmingIntent(null)}
                className="py-2 rounded-xl bg-slate-700 text-slate-200 font-bold text-xs hover:bg-slate-600"
              >
                {t.noCancel}
              </button>
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <p className="text-xs text-amber-300 mb-3 bg-amber-950/60 p-2.5 rounded-xl border border-amber-600/40">
            {errorMessage}
          </p>
        )}

        {/* Language Indicator */}
        <div className="text-xs text-slate-400">
          <span>{language === 'ta' ? 'மொழி: தமிழ்' : 'Language: English'}</span>
        </div>
      </div>
    </div>
  );
};
