import { useState, useEffect, useRef, useCallback } from 'react';
import { useVoiceRecognition, RecognitionState } from './useVoiceRecognition';
import { isSarvamConfigured } from '@/lib/sarvam';

interface UseVoiceConversationOptions {
  lang: string;
  onLanguageDetected?: (detectedLang: string) => void;
  onSubmit: (transcript: string) => void;
}

export function useVoiceConversation({
  lang,
  onLanguageDetected,
  onSubmit,
}: UseVoiceConversationOptions) {
  // Use the existing browser SpeechRecognition hook for real-time visual feedback/interim results
  const voiceRec = useVoiceRecognition({
    lang,
    onAutoSubmit: onSubmit,
  });

  const [isSarvamProcessing, setIsSarvamProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // Start MediaRecorder in parallel with SpeechRecognition
  const startRecording = useCallback(async () => {
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(250); // collect chunks every 250ms
    } catch (err) {
      console.warn('[useVoiceConversation] MediaRecorder failed to start, using browser fallback:', err);
    }
  }, []);

  // Stop MediaRecorder and release media streams
  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const mediaRecorder = mediaRecorderRef.current;
      if (!mediaRecorder || mediaRecorder.state === 'inactive') {
        resolve(null);
        return;
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        resolve(audioBlob);
      };

      try {
        mediaRecorder.stop();
      } catch (e) {
        resolve(null);
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      mediaRecorderRef.current = null;
    });
  }, []);

  const handleStartListening = useCallback(async () => {
    // Start recording audio
    await startRecording();
    // Start native Web Speech API recognition for interim results
    voiceRec.startListening();
  }, [startRecording, voiceRec]);

  const handleStopListening = useCallback(async (shouldSubmit = false) => {
    // Stop native recognition
    voiceRec.stopListening();

    // Stop recording audio and grab the recorded Blob
    const audioBlob = await stopRecording();

    if (shouldSubmit && audioBlob && audioBlob.size > 1000) {
      setIsSarvamProcessing(true);
      voiceRec.setRecognitionState('PROCESSING');

      try {
        // Send the audio blob to the speech-to-text API
        const formData = new FormData();
        formData.append('file', audioBlob, 'speech.webm');
        formData.append('lang', lang);

        const res = await fetch('/api/speech', {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          if (data && data.transcript) {
            const sarvamTranscript = data.transcript.trim();
            console.log('[useVoiceConversation] Sarvam Transcript:', sarvamTranscript);

            // Handle language detection if returned
            if (data.languageCode && onLanguageDetected) {
              const detected = data.languageCode.includes('-') ? data.languageCode : `${data.languageCode}-IN`;
              console.log('[useVoiceConversation] Detected language:', detected);
              onLanguageDetected(detected);
            }

            voiceRec.setTranscript(sarvamTranscript);
            setIsSarvamProcessing(false);
            onSubmit(sarvamTranscript);
            return;
          }
        }
      } catch (err) {
        console.error('[useVoiceConversation] Sarvam STT failed, falling back to Web Speech API:', err);
      } finally {
        setIsSarvamProcessing(false);
      }
    }

    // Fallback: If not submitting, or if Sarvam failed/was unconfigured, submit browser transcript
    if (shouldSubmit) {
      const finalBrowserTranscript = voiceRec.transcript.trim();
      if (finalBrowserTranscript) {
        onSubmit(finalBrowserTranscript);
      }
    }
  }, [stopRecording, voiceRec, lang, onLanguageDetected, onSubmit]);

  return {
    recognitionState: voiceRec.recognitionState,
    setRecognitionState: voiceRec.setRecognitionState,
    transcript: voiceRec.transcript,
    setTranscript: voiceRec.setTranscript,
    startListening: handleStartListening,
    stopListening: () => handleStopListening(false),
    submitListening: () => handleStopListening(true),
    isProcessing: voiceRec.recognitionState === 'PROCESSING' || isSarvamProcessing,
  };
}
