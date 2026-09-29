import { Language } from '../types/index.js';

export type VoiceIntent =
  | 'REPORT_FLOOD'
  | 'REQUEST_HELP'
  | 'SAFETY_CHECK'
  | 'FIND_SHELTER'
  | 'FIND_RESOURCE'
  | 'REGISTER_VOLUNTEER'
  | 'VIEW_ALERTS'
  | 'VIEW_NEARBY_HELP'
  | 'UNKNOWN';

export interface RecognizedResult {
  transcript: string;
  intent: VoiceIntent;
  confidence: number;
}

export class VoiceAssistantService {
  private recognition: any = null;
  private isListening = false;

  constructor() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.maxAlternatives = 1;
    }
  }

  public isSupported(): boolean {
    return Boolean(this.recognition);
  }

  public startListening(
    lang: Language,
    onResult: (result: RecognizedResult) => void,
    onError: (err: any) => void
  ) {
    if (!this.recognition) {
      onError(new Error('Speech recognition is not supported in this browser. You can still use the visual one-tap actions.'));
      return;
    }

    if (this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }

    this.recognition.lang = lang === 'ta' ? 'ta-IN' : 'en-IN';
    this.isListening = true;

    this.recognition.onresult = (event: any) => {
      this.isListening = false;
      const transcript = event.results[0][0].transcript.trim();
      const confidence = event.results[0][0].confidence;
      const intent = this.classifyIntent(transcript);
      onResult({ transcript, intent, confidence });
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      onError(event);
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    try {
      this.recognition.start();
    } catch (e) {
      this.isListening = false;
      onError(e);
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
    this.isListening = false;
  }

  public classifyIntent(text: string): VoiceIntent {
    const lower = text.toLowerCase();

    // Flood patterns (Tamil + English)
    if (
      lower.includes('வெள்ளம்') ||
      lower.includes('தண்ணீர்') ||
      lower.includes('flood') ||
      lower.includes('waterlog') ||
      lower.includes('water logging')
    ) {
      return 'REPORT_FLOOD';
    }

    // Safety check patterns
    if (
      lower.includes('பாதுகாப்பாக') ||
      lower.includes('நான் நலம்') ||
      lower.includes('safe') ||
      lower.includes('i am safe')
    ) {
      return 'SAFETY_CHECK';
    }

    // Help / Medical / Rescue patterns
    if (
      lower.includes('உதவி') ||
      lower.includes('மருத்துவம்') ||
      lower.includes('ஆம்புலன்ஸ்') ||
      lower.includes('மீட்பு') ||
      lower.includes('help') ||
      lower.includes('rescue') ||
      lower.includes('doctor') ||
      lower.includes('emergency')
    ) {
      return 'REQUEST_HELP';
    }

    // Shelter patterns
    if (
      lower.includes('முகாம்') ||
      lower.includes('தங்குமிடம்') ||
      lower.includes('shelter') ||
      lower.includes('camp')
    ) {
      return 'FIND_SHELTER';
    }

    // Resources / Food / Water
    if (
      lower.includes('உணவு') ||
      lower.includes('குடிநீர்') ||
      lower.includes('பொருட்கள்') ||
      lower.includes('food') ||
      lower.includes('water') ||
      lower.includes('supplies') ||
      lower.includes('resource')
    ) {
      return 'FIND_RESOURCE';
    }

    // Volunteer
    if (
      lower.includes('தன்னார்வலர்') ||
      lower.includes('volunteer')
    ) {
      return 'REGISTER_VOLUNTEER';
    }

    // Alerts
    if (
      lower.includes('எச்சரிக்கை') ||
      lower.includes('alert') ||
      lower.includes('warning')
    ) {
      return 'VIEW_ALERTS';
    }

    return 'UNKNOWN';
  }

  public speak(text: string, lang: Language) {
    if (!('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'ta' ? 'ta-IN' : 'en-IN';
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      // Select matching voice if available
      const voices = window.speechSynthesis.getVoices();
      const targetLangPrefix = lang === 'ta' ? 'ta' : 'en';
      const voice = voices.find((v) => v.lang.startsWith(targetLangPrefix));
      if (voice) {
        utterance.voice = voice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis failed:', err);
    }
  }
}

export const voiceService = new VoiceAssistantService();
