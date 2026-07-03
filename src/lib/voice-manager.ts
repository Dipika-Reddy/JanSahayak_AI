export class VoiceManager {
  private static instance: VoiceManager;
  private voices: SpeechSynthesisVoice[] = [];
  private currentLanguage: string = 'en-IN';
  private cloudAudio: HTMLAudioElement | null = null;
  private isSpeaking: boolean = false;
  
  // Queue system
  private audioQueue: string[] = [];
  private isProcessingQueue: boolean = false;
  private globalOnStart?: () => void;
  private globalOnEnd?: () => void;

  private constructor() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      this.loadVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.loadVoices();
      };
    }
  }

  public static getInstance(): VoiceManager {
    if (!VoiceManager.instance) {
      VoiceManager.instance = new VoiceManager();
    }
    return VoiceManager.instance;
  }

  private loadVoices() {
    this.voices = window.speechSynthesis.getVoices();
  }

  public changeLanguage(lang: string) {
    this.currentLanguage = lang;
    console.log(`[VoiceManager] Language instantly switched to: ${this.currentLanguage}`);
  }

  public stop() {
    this.audioQueue = []; // Clear queue immediately
    this.isProcessingQueue = false;
    this.isSpeaking = false;

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (this.cloudAudio) {
      this.cloudAudio.pause();
      this.cloudAudio.removeAttribute('src');
      this.cloudAudio.load();
      this.cloudAudio = null;
    }
    if (this.globalOnEnd) {
      this.globalOnEnd();
      this.globalOnEnd = undefined;
    }
  }

  public pause() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.pause();
    }
    if (this.cloudAudio) {
      this.cloudAudio.pause();
    }
  }

  public resume() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.resume();
    }
    if (this.cloudAudio) {
      this.cloudAudio.play().catch(e => console.error("Error resuming cloud audio", e));
    }
  }

  // Allow passing an array of strings for queued reading with natural pauses
  public speak(
    textOrTexts: string | string[], 
    lang: string = this.currentLanguage, 
    onStart?: () => void, 
    onEnd?: () => void
  ) {
    this.stop(); // Interruption: Cancel any previous speech/queue immediately

    let textsToQueue: string[] = [];
    if (Array.isArray(textOrTexts)) {
      textsToQueue = textOrTexts;
    } else {
      // Chunk long text by sentences to allow natural queuing
      textsToQueue = textOrTexts.match(/[^.!?]+[.!?]*/g) || [textOrTexts];
    }
    
    // Clean up texts
    textsToQueue = textsToQueue.map(t => t.replace(/[*#]/g, '').trim()).filter(t => t.length > 0);

    if (textsToQueue.length === 0) {
      if (onEnd) onEnd();
      return;
    }

    this.audioQueue = textsToQueue;
    this.globalOnStart = onStart;
    this.globalOnEnd = onEnd;
    this.currentLanguage = lang; // Ensure sync

    console.log(`[VoiceManager] Starting new speech queue for lang: ${lang} (${this.audioQueue.length} chunks)`);
    this.processQueue();
  }

  private processQueue() {
    if (this.audioQueue.length === 0) {
      this.isProcessingQueue = false;
      this.isSpeaking = false;
      if (this.globalOnEnd) {
        this.globalOnEnd();
        this.globalOnEnd = undefined;
      }
      return;
    }

    this.isProcessingQueue = true;
    const chunkText = this.audioQueue.shift()!;
    
    if (!this.isSpeaking && this.globalOnStart) {
      this.globalOnStart();
      this.globalOnStart = undefined; // Only call once per total queue
    }
    this.isSpeaking = true;

    // PREFERRED: Cloud TTS Priority
    // We prioritize Cloud TTS for native Indian languages because browser support is incredibly inconsistent
    const isIndianLanguage = ['te', 'hi', 'ta', 'kn', 'ml', 'bn', 'mr', 'gu', 'pa'].includes(this.currentLanguage.split('-')[0]);
    
    if (isIndianLanguage) {
      console.log(`[VoiceManager] Using Cloud TTS (Preferred) for: ${this.currentLanguage}`);
      this.playCloudAudio(chunkText, this.currentLanguage);
    } else {
      // For English or if cloud fails, fallback to browser
      const bestVoice = this.findBestBrowserVoice(this.currentLanguage);
      if (bestVoice && typeof window !== 'undefined' && window.speechSynthesis) {
        console.log(`[VoiceManager] Using Browser TTS (Fallback) for: ${this.currentLanguage}`);
        this.playBrowserAudio(chunkText, bestVoice);
      } else {
        // Ultimate fallback
        this.playCloudAudio(chunkText, this.currentLanguage);
      }
    }
  }

  private playCloudAudio(text: string, lang: string) {
    const baseLang = lang.split('-')[0];
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${baseLang}&client=tw-ob`;
    
    this.cloudAudio = new Audio(url);
    
    this.cloudAudio.onended = () => {
      // Add a natural 300ms pause between chunks like Google Assistant
      setTimeout(() => {
        if (this.isProcessingQueue) this.processQueue();
      }, 300);
    };

    this.cloudAudio.onerror = (e) => {
      console.warn("[VoiceManager] Cloud Audio Failed. Attempting Browser Fallback...", e);
      const bestVoice = this.findBestBrowserVoice(lang);
      if (bestVoice) {
        this.playBrowserAudio(text, bestVoice);
      } else {
        if (this.isProcessingQueue) this.processQueue(); // skip chunk gracefully
      }
    };

    this.cloudAudio.play().catch(e => {
      console.error("[VoiceManager] Audio play blocked:", e);
      if (this.isProcessingQueue) this.processQueue();
    });
  }

  private playBrowserAudio(text: string, voice: SpeechSynthesisVoice) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice;
    utterance.lang = voice.lang;
    utterance.rate = 0.9;
    
    utterance.onend = () => {
      setTimeout(() => {
        if (this.isProcessingQueue) this.processQueue();
      }, 300);
    };

    utterance.onerror = (e) => {
      console.error("[VoiceManager] SpeechSynthesis Error:", e);
      if (this.isProcessingQueue) this.processQueue();
    };

    window.speechSynthesis.speak(utterance);
  }

  private findBestBrowserVoice(langCode: string): SpeechSynthesisVoice | null {
    if (!this.voices.length && typeof window !== 'undefined') {
      this.voices = window.speechSynthesis.getVoices();
    }

    const exactMatch = this.voices.find(v => v.lang === langCode || v.lang.replace('_', '-') === langCode);
    if (exactMatch) return exactMatch;

    const baseLang = langCode.split('-')[0];
    const partialMatch = this.voices.find(v => v.lang.startsWith(baseLang));
    return partialMatch || null;
  }
}

export const voiceManager = typeof window !== 'undefined' ? VoiceManager.getInstance() : null;
