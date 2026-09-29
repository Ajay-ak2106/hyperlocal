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
        console.warn('Speech recognition note:', err);
        const isNetErr = err?.error === 'network';
        setErrorMessage(
          isNetErr
            ? (language === 'ta'
                ? 'இணைய இணைப்பு குறைவு. கீழே உள்ள உடனடி பொத்தான்களைப் பயன்படுத்தி பதிவு செய்யலாம்.'
                : 'Voice service requires internet. You can use the one-tap emergency buttons below.')
            : (language === 'ta'
                ? 'குரலைக் கேட்க முடியவில்லை. தயவுசெய்து மீண்டும் பேசவும் அல்லது கீழே உள்ள பொத்தான்களைப் பயன்படுத்தவும்.'
                : 'Could not capture voice. Please try again or tap the emergency buttons.')
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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-cyber-panel border border-cyber-cyan/40 p-6 shadow-neon-cyan flex flex-col items-center text-center relative overflow-hidden">
        {/* Decorative corner brackets */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyber-cyan"></div>
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyber-cyan"></div>
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyber-cyan"></div>
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyber-cyan"></div>

        {/* Close Button & HUD Header */}
        <div className="w-full flex justify-between items-center mb-2 pb-2 border-b border-cyber-border">
          <span className="text-[11px] font-mono font-bold text-cyber-cyan uppercase tracking-widest flex items-center gap-1.5 glow-text-cyan">
            <Volume2 className="w-4 h-4 animate-pulse text-cyber-cyan" />
            [AI COMM LINK // {language === 'ta' ? 'குரல் உதவியாளர்' : 'VOICE HUD'}]
          </span>
          <button
            onClick={() => {
              voiceService.stopListening();
              onClose();
            }}
            className="p-1 rounded text-slate-400 hover:text-cyber-cyan hover:bg-cyber-cyan/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Instructions */}
        <h3 className="text-base sm:text-lg font-mono font-extrabold text-white mt-2 tracking-wide">
          {language === 'ta' ? 'பேசி உடனடி உதவி பெறவும்' : 'COMM LINK: VOICE INPUT'}
        </h3>
        <p className="text-xs text-slate-400 font-mono mt-1 max-w-xs">
          {language === 'ta'
            ? 'உதாரணம்: "எனக்கு உதவி வேண்டும்", "வெள்ளம் இருக்கு", "நான் பாதுகாப்பாக இருக்கிறேன்"'
            : 'Commands: "Emergency Help", "Report Flood Level", "Mark Safe", "Find Shelter"'}
        </p>

        {/* Large Central Microphone Button */}
        <div className="my-7 relative flex items-center justify-center">
          {isListening && (
            <div className="absolute w-36 h-36 rounded-full border border-cyber-green/50 bg-cyber-green/10 animate-ping pointer-events-none" />
          )}
          <button
            onClick={isListening ? () => voiceService.stopListening() : handleStartListening}
            className={`w-28 h-28 rounded-full flex flex-col items-center justify-center transition-all duration-300 active:scale-95 touch-target ${
              isListening
                ? 'bg-cyber-green text-black shadow-neon-green ring-8 ring-cyber-green/20'
                : 'bg-cyber-bg border-2 border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan/10 shadow-neon-cyan'
            }`}
          >
            {isListening ? (
              <MicOff className="w-10 h-10 animate-pulse text-black" />
            ) : (
              <Mic className="w-10 h-10 text-cyber-cyan" />
            )}
            <span className="text-[10px] font-mono font-bold mt-1 tracking-wider uppercase">
              {isListening ? (language === 'ta' ? 'கேட்கிறது...' : 'LISTENING...') : (language === 'ta' ? 'பேசுங்கள்' : 'TAP MIC')}
            </span>
          </button>
        </div>

        {/* Live Transcript Display */}
        {transcript && (
          <div className="w-full p-3 rounded-lg bg-cyber-bg border border-cyber-green/40 text-left mb-4 shadow-[0_0_10px_rgba(0,255,157,0.15)]">
            <span className="text-[10px] font-mono font-bold text-cyber-green uppercase tracking-wider block">
              &gt; {language === 'ta' ? 'நீங்கள் கூறியது:' : 'TRANSCRIBED:'}
            </span>
            <p className="text-sm font-mono text-white mt-1">
              "{transcript}"
            </p>
          </div>
        )}

        {/* Confirmation Flow for Voice Actions */}
        {confirmingIntent && (
          <div className="w-full p-4 rounded-xl bg-cyber-bg/90 border border-cyber-red/60 text-center mb-4 shadow-[0_0_15px_rgba(255,42,85,0.25)]">
            <div className="flex items-center justify-center gap-1.5 text-cyber-red font-mono font-bold text-xs uppercase mb-1">
              <AlertCircle className="w-4 h-4" />
              {t.confirmHelpTitle}
            </div>
            <p className="text-sm font-mono font-bold text-white mb-3">
              {confirmingIntent === 'REQUEST_HELP' && (language === 'ta' ? 'அவசர உதவி கோரவா?' : 'Dispatch Emergency Help Request?')}
              {confirmingIntent === 'REPORT_FLOOD' && (language === 'ta' ? 'வெள்ளப் பதிவு தொடங்கவா?' : 'Open Flood Telemetry Form?')}
              {confirmingIntent === 'SAFETY_CHECK' && (language === 'ta' ? 'பாதுகாப்பாக உள்ளீர்கள் என்று பதிவு செய்யவா?' : 'Transmit SAFE Status to HQ?')}
            </p>

            <div className="grid grid-cols-2 gap-2 font-mono">
              <button
                disabled={isProcessing}
                onClick={handleConfirmAction}
                className="py-2.5 rounded bg-cyber-green text-black font-extrabold text-xs flex items-center justify-center gap-1 shadow-neon-green hover:brightness-110"
              >
                <Check className="w-4 h-4 stroke-[3px]" />
                {t.yesConfirm}
              </button>
              <button
                onClick={() => setConfirmingIntent(null)}
                className="py-2.5 rounded bg-cyber-panel border border-slate-700 font-bold text-xs text-slate-300 hover:text-white flex items-center justify-center gap-1"
              >
                <X className="w-4 h-4 stroke-[3px]" />
                {t.noCancel}
              </button>
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <p className="text-xs text-cyber-amber mb-4 bg-cyber-amber/10 p-2.5 rounded border border-cyber-amber/40 font-mono">
            {errorMessage}
          </p>
        )}

        {/* Language Indicator */}
        <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
          <span>ACTIVE COMM FREQ:</span>
          <span className="font-bold text-cyber-green">{language === 'ta' ? 'TAMIL (தமிழ்)' : 'EN-US'}</span>
        </div>
      </div>
    </div>
  );
};
