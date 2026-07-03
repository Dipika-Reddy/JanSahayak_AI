import { useState, useEffect, useRef, useCallback } from 'react';

export type RecognitionState = 'IDLE' | 'LISTENING' | 'PROCESSING' | 'SPEAKING';

interface UseVoiceRecognitionOptions {
  lang: string;
  onAutoSubmit: (transcript: string) => void;
  silenceTimeoutMs?: number;
}

export function useVoiceRecognition({ lang, onAutoSubmit, silenceTimeoutMs = 5000 }: UseVoiceRecognitionOptions) {
  const [recognitionState, setRecognitionState] = useState<RecognitionState>('IDLE');
  const [transcript, setTranscript] = useState("");
  
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const cleanupRecognition = useCallback(() => {
    clearSilenceTimer();
    if (recognitionRef.current) {
      recognitionRef.current.onstart = null;
      recognitionRef.current.onresult = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.onend = null;
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore abort errors if already stopped
      }
      recognitionRef.current = null;
    }
  }, [clearSilenceTimer]);

  const stopListening = useCallback(() => {
    cleanupRecognition();
    setRecognitionState(prev => prev === 'LISTENING' ? 'IDLE' : prev);
  }, [cleanupRecognition]);

  // We need startListening to reset silence timer and start recognition
  // But wait, resetSilenceTimer references stopListening and cleanupRecognition, which is fine since we use refs and dependencies.
  
  // Create resetSilenceTimer here
  const resetSilenceTimer = useCallback((currentText: string) => {
    clearSilenceTimer();
    silenceTimerRef.current = setTimeout(() => {
      // Timer fired!
      const textToSubmit = currentText.trim();
      if (textToSubmit) {
        cleanupRecognition();
        setRecognitionState('PROCESSING');
        onAutoSubmit(textToSubmit);
      } else {
        stopListening();
      }
    }, silenceTimeoutMs);
  }, [clearSilenceTimer, silenceTimeoutMs, onAutoSubmit, cleanupRecognition, stopListening]);

  const startListening = useCallback(() => {
    if (recognitionState === 'PROCESSING') {
      return;
    }
    
    // Interruption: Instantly stop TTS when user starts listening
    import('@/lib/voice-manager').then(({ voiceManager }) => {
      voiceManager?.stop();
    });

    cleanupRecognition();
    setTranscript("");
    
    if (typeof window !== "undefined") {
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        console.error("SpeechRecognition is not supported in this browser.");
        return;
      }
      
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = lang;

      recognition.onstart = () => {
        setRecognitionState('LISTENING');
        resetSilenceTimer("");
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
        resetSilenceTimer(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        if (event.error !== 'no-speech') {
           stopListening();
        }
      };

      recognition.onend = () => {
        setRecognitionState(prev => prev === 'LISTENING' ? 'IDLE' : prev);
      };

      try {
        recognition.start();
      } catch (e) {
        console.error("Failed to start SpeechRecognition:", e);
        stopListening();
      }
    }
  }, [lang, recognitionState, cleanupRecognition, stopListening, resetSilenceTimer]);

  useEffect(() => {
    return cleanupRecognition;
  }, [cleanupRecognition]);

  return {
    recognitionState,
    setRecognitionState,
    transcript,
    setTranscript,
    startListening,
    stopListening
  };
}
