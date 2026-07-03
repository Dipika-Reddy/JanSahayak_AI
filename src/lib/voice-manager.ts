export class VoiceManager {
  private static instance: VoiceManager;
  private voices: SpeechSynthesisVoice[] = [];
  private currentLanguage: string = 'en-IN';
  private cloudAudio: HTMLAudioElement | null = null;
  private isBrowserSpeaking: boolean = false;

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
    console.log(`[VoiceManager] Loaded ${this.voices.length} native browser voices.`);
  }

  public changeLanguage(lang: string) {
    this.currentLanguage = lang;
    console.log(`[VoiceManager] Selected Language changed to: ${this.currentLanguage}`);
  }

  public stop() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      this.isBrowserSpeaking = false;
    }
    if (this.cloudAudio) {
      this.cloudAudio.pause();
      this.cloudAudio.currentTime = 0;
      this.cloudAudio = null;
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

  private findBestVoice(langCode: string): SpeechSynthesisVoice | null {
    if (!this.voices.length) this.loadVoices();

    const exactMatch = this.voices.find(v => v.lang === langCode);
    if (exactMatch) return exactMatch;

    const baseLang = langCode.split('-')[0];
    const partialMatch = this.voices.find(v => v.lang.startsWith(baseLang));
    
    return partialMatch || null;
  }

  public speak(
    text: string, 
    lang: string = this.currentLanguage, 
    onStart?: () => void, 
    onEnd?: () => void
  ) {
    this.stop(); // Always cancel previous speech

    if (!text || text.trim() === '') {
      if (onEnd) onEnd();
      return;
    }

    // Clean up text for TTS (remove markdown asterisks, hashes, etc.)
    const cleanText = text.replace(/[*#]/g, '').trim();

    console.log(`[VoiceManager] Preparing to speak...`);
    console.log(`- Translation Locale: ${lang}`);
    console.log(`- Speech Synthesis Supported: ${typeof window !== 'undefined' && !!window.speechSynthesis}`);
    console.log(`- Number of Installed Voices: ${this.voices.length}`);

    const bestVoice = this.findBestVoice(lang);

    if (bestVoice && typeof window !== 'undefined' && window.speechSynthesis) {
      console.log(`- Selected Voice: ${bestVoice.name} (Native Browser)`);
      console.log(`- Voice Locale: ${bestVoice.lang}`);
      
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.voice = bestVoice;
      utterance.lang = bestVoice.lang; // Must explicitly set lang to match voice
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onstart = () => {
        this.isBrowserSpeaking = true;
        if (onStart) onStart();
      };
      
      utterance.onend = () => {
        this.isBrowserSpeaking = false;
        if (onEnd) onEnd();
      };
      
      utterance.onerror = (e) => {
        console.error("[VoiceManager] SpeechSynthesis Error:", e);
        this.isBrowserSpeaking = false;
        if (onEnd) onEnd();
      };

      window.speechSynthesis.speak(utterance);
    } else {
      console.warn(`[VoiceManager] No native voice found for ${lang}. Falling back to Cloud TTS.`);
      console.log(`- Selected Voice: Google Translate TTS (Cloud Fallback)`);
      console.log(`- Voice Locale: ${lang}`);
      
      this.speakWithCloudFallback(cleanText, lang, onStart, onEnd);
    }
  }

  private speakWithCloudFallback(text: string, lang: string, onStart?: () => void, onEnd?: () => void) {
    // Note: The Google Translate TTS endpoint expects standard short ISO codes (e.g. 'te' instead of 'te-IN')
    const baseLang = lang.split('-')[0];
    
    // Google Translate TTS is limited to ~200 characters per request.
    // We will chunk it roughly by sentences.
    const chunks = text.match(/[^.!?]+[.!?]*/g) || [text];
    let currentChunkIndex = 0;

    const playNextChunk = () => {
      if (currentChunkIndex >= chunks.length) {
        if (onEnd) onEnd();
        return;
      }
      
      const chunkText = chunks[currentChunkIndex].trim();
      if (!chunkText) {
        currentChunkIndex++;
        playNextChunk();
        return;
      }

      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunkText)}&tl=${baseLang}&client=tw-ob`;
      this.cloudAudio = new Audio(url);
      
      if (currentChunkIndex === 0 && onStart) {
        onStart();
      }

      this.cloudAudio.onended = () => {
        currentChunkIndex++;
        playNextChunk();
      };

      this.cloudAudio.onerror = (e) => {
        console.error("[VoiceManager] Cloud Audio Error:", e);
        if (onEnd) onEnd(); // gracefully fail
      };

      this.cloudAudio.play().catch(e => {
        console.error("[VoiceManager] Audio play blocked or failed:", e);
        if (onEnd) onEnd();
      });
    };

    playNextChunk();
  }
}

export const voiceManager = typeof window !== 'undefined' ? VoiceManager.getInstance() : null;
