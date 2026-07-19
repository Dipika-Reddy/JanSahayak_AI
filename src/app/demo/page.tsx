"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Mic, Globe, Volume2, ArrowRight, Loader2, CheckCircle2, FileText, MapPin, Square, Play, Pause, SkipBack, SkipForward, Repeat } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SUPPORTED_LANGUAGES, TRANSLATIONS } from "@/lib/translations";
import { useVoiceConversation } from "@/hooks/useVoiceConversation";
import { voiceManager } from "@/lib/voice-manager";
import { SchemeList } from "@/components/SchemeList";

// --- Clean HTML helper ---
const cleanHtmlText = (text: string): string => {
  if (!text) return "";
  return text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?[^>]+(>|$)/g, "")
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s*\n\s*\n+/g, '\n\n')
    .trim();
};

// --- Static T component placeholder ---
// (Local T component is defined inside VoiceInterfaceContent to support dynamic translation)

function VoiceInterfaceContent() {
  const searchParams = useSearchParams();
  const langQuery = searchParams.get('lang') || 'en-IN';
  
  const [currentLang, setCurrentLang] = useState(langQuery);
  const [processingState, setProcessingState] = useState("");
  
  const [dynamicTranslations, setDynamicTranslations] = useState<Record<string, string>>({});
  const [isTranslating, setIsTranslating] = useState(false);

  // List of all UI strings to translate dynamically
  const UI_STRINGS = [
    'Home',
    'Discover Government Schemes tailored for you.',
    'Tell us about yourself (age, occupation, state, gender, income) and we will find the best schemes for you.',
    'Eligible Schemes',
    'No matching schemes found for this profile.',
    'Why you qualify',
    'Benefits',
    'Required Documents',
    'Apply Online',
    'Find Nearby Center',
    'Listening... Press \u27a4 or Enter to submit',
    'Listening...',
    'Tap to speak, or type below',
    'Understanding your profile...',
    'Finding eligible schemes...',
    'Eligible',
    'Not Eligible',
    'Need Info',
    'Likely Eligible',
    'Try asking:',
    'I am a farmer from Andhra Pradesh.',
    'I am a college student from Telangana.',
    'I am a pregnant woman from Karnataka.',
    'I am a 68-year-old senior citizen from Kerala.',
    'Offline Application:',
    'Nearest Office:',
    'First',
    'Previous',
    'Next',
    'Last',
    'Page',
    'Showing',
    'of',
    'schemes'
  ];

  // Dynamically translate UI when a language other than standard ones is chosen
  useEffect(() => {
    const translateUI = async () => {
      // Statically supported languages are en-IN, hi-IN, te-IN, ta-IN (MR and BN have minimal static files, so we translate dynamically)
      const isStatic = ['en-IN', 'hi-IN', 'te-IN', 'ta-IN'].includes(currentLang);
      if (!isStatic) {
        // Check local storage cache first
        const cacheKey = `trans_demo_v2_${currentLang}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          try {
            setDynamicTranslations(JSON.parse(cached));
            return;
          } catch (e) {
            console.error("Failed to parse cached translations", e);
          }
        }

        setIsTranslating(true);
        try {
          const res = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ texts: UI_STRINGS, targetLang: currentLang })
          });
          const data = await res.json();
          if (data.translations) {
            setDynamicTranslations(data.translations);
            localStorage.setItem(cacheKey, JSON.stringify(data.translations));
          }
        } catch (e) {
          console.error("Dynamic UI translation failed:", e);
        } finally {
          setIsTranslating(false);
        }
      } else {
        setDynamicTranslations({});
      }
    };

    translateUI();
  }, [currentLang]);

  // Local Translate component
  const T = ({ children, lang }: { children: string, lang: string }) => {
    if (dynamicTranslations[children]) {
      return <>{dynamicTranslations[children]}</>;
    }

    const t = TRANSLATIONS[lang] || TRANSLATIONS['en-IN'];
    
    const stringMap: Record<string, string> = {
      'Home': t.home,
      'Discover Government Schemes tailored for you.': t.discoverTitle,
      'Tell us about yourself (age, occupation, state, gender, income) and we will find the best schemes for you.': t.discoverDesc,
      'Eligible Schemes': t.eligibleSchemes,
      'No matching schemes found for this profile.': t.noSchemes,
      'Why you qualify': t.whyQualify,
      'Benefits': t.benefits,
      'Required Documents': t.requiredDocs,
      'Apply Online': t.applyOnline,
      'Find Nearby Center': t.findCenter,
      'Listening (will auto-submit when you stop speaking)...': t.listeningAuto,
      'Listening...': t.listening,
      'Tap to speak, or type below': t.tapToSpeak,
      'Understanding your profile...': t.processing,
      'Finding eligible schemes...': t.finding,
      'Eligible': t.eligible,
      'Not Eligible': t.notEligible,
      'Need Info': t.needMoreInfo,
      'Likely Eligible': t.likelyEligible,
      'Try asking:': t.tryAsking || 'Try asking:',
      'I am a farmer from Andhra Pradesh.': t.prompt1 || 'I am a farmer from Andhra Pradesh.',
      'I am a college student from Telangana.': t.prompt2 || 'I am a college student from Telangana.',
      'I am a pregnant woman from Karnataka.': t.prompt3 || 'I am a pregnant woman from Karnataka.',
      'I am a 68-year-old senior citizen from Kerala.': t.prompt4 || 'I am a 68-year-old senior citizen from Kerala.',
      'Showing': t.Showing || 'Showing',
      'of': t.of || 'of',
      'schemes': t.schemes || 'schemes',
      'Page': t.Page || 'Page',
      'Previous': t.Previous || 'Previous',
      'Next': t.Next || 'Next'
    };

    return <>{stringMap[children] || children}</>;
  };
  const [profile, setProfile] = useState<any>(null);
  const [results, setResults] = useState<any[] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  
  const [speakingScheme, setSpeakingScheme] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentReadIndex, setCurrentReadIndex] = useState(-1);

  const handleSubmit = async (overrideText: string) => {
    const textToSubmit = overrideText.trim();
    if (!textToSubmit) return;
    
    // Stop any currently playing TTS before a new prompt
    stopTTS();

    // Contextual Routing
    if (!results) {
      await handleInitialSearch(textToSubmit);
    } else {
      await handleFollowUpChat(textToSubmit);
    }
  };
  
  const {
    recognitionState,
    setRecognitionState,
    transcript,
    setTranscript,
    startListening,
    stopListening,
    submitListening,
    isProcessing: isSarvamProcessing
  } = useVoiceConversation({
    lang: currentLang,
    onLanguageDetected: (detectedLang) => {
      setCurrentLang(detectedLang);
      window.history.replaceState(null, '', `?lang=${detectedLang}`);
    },
    onSubmit: handleSubmit
  });

  const isListening = recognitionState === 'LISTENING';
  const isProcessing = recognitionState === 'PROCESSING';

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const runSchemeMatching = async (currentProfile: any, langOverride?: string) => {
    try {
      const matchRes = await fetch("/api/match-schemes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: currentProfile, lang: langOverride || currentLang }),
      });
      const matchData = await matchRes.json();
      if (matchData.error) throw new Error(matchData.error);
      setResults(matchData.matches);
      setCurrentPage(1);
      return matchData.matches;
    } catch (e) {
      console.error("Failed to update scheme matches:", e);
      return results || [];
    }
  };

  const handleInitialSearch = async (textToSubmit: string) => {
    try {
      setProcessingState("Understanding your profile...");
      const profileRes = await fetch("/api/extract-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: textToSubmit }),
      });
      const profileData = await profileRes.json();
      if (profileData.error) throw new Error(profileData.error);
      
      // Always use the user's explicitly selected language — do NOT auto-override it
      const targetLang = currentLang;

      setProfile(profileData.profile);
      setProcessingState("Finding matching schemes...");
      
      const matches = await runSchemeMatching(profileData.profile, targetLang);
      
      // Build the response text in the selected language
      const staticT = TRANSLATIONS[targetLang];
      let respText: string;
      if (staticT?.foundSchemes1) {
        // Static translation available (en, hi, te, ta)
        respText = `${staticT.foundSchemes1}${matches.length}${staticT.foundSchemes2}`;
      } else {
        // Dynamically translate for other languages
        const englishText = `I found ${matches.length} schemes for you. You can ask me to read them or ask follow-up questions.`;
        try {
          const langCode = targetLang.split('-')[0];
          const ttsLang = ['brx', 'ks', 'mni', 'sat', 'doi', 'mai', 'kok'].includes(langCode) ? 'hi' : langCode;
          const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${ttsLang}&dt=t&q=${encodeURIComponent(englishText)}`;
          const res = await fetch(url);
          const data = await res.json();
          respText = data?.[0]?.map((x: any) => x[0]).join('') || englishText;
        } catch {
          respText = `I found ${matches.length} schemes for you. You can ask me to read them or ask follow-up questions.`;
        }
      }

      setMessages([
        { role: 'user', content: textToSubmit },
        { role: 'assistant', content: respText }
      ]);
      
      speakResponse(respText, targetLang);

    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      if (recognitionState === 'PROCESSING') {
        setRecognitionState('IDLE');
      }
    }
  };


  const handleFollowUpChat = async (textToSubmit: string) => {
    const newMessages = [...messages, { role: 'user' as const, content: textToSubmit }];
    setMessages(newMessages);
    
    try {
      setProcessingState("Thinking...");
      const chatRes = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: newMessages,
          context: { profile, schemes: results },
          lang: currentLang
        }),
      });
      const chatData = await chatRes.json();
      if (chatData.error) throw new Error(chatData.error);
      
      const { intent, targetSchemeId, acknowledgment, spokenResponse, extractedProfileDiff } = chatData;
      
      // Update UI with short acknowledgment only
      setMessages([...newMessages, { role: 'assistant', content: acknowledgment || "..." }]);
      
      // Merge new profile fields if extracted, then update scheme matches
      let activeResults = results || [];
      if (extractedProfileDiff && Object.keys(extractedProfileDiff).length > 0) {
        const mergedProfile = {
          ...(profile || {}),
          ...Object.fromEntries(
            Object.entries(extractedProfileDiff).filter(([_, v]) => v !== null && v !== undefined)
          )
        };
        setProfile(mergedProfile);
        activeResults = await runSchemeMatching(mergedProfile);
      }

      // Handle Intents
      if (intent === 'STOP') {
         stopTTS();
      } else if (intent === 'PAUSE') {
         pauseTTS();
      } else if (intent === 'RESUME') {
         resumeTTS();
      } else if (intent === 'NEXT') {
         nextScheme();
      } else if (intent === 'PREV') {
         prevScheme();
      } else if (intent === 'REPEAT') {
         repeatTTS();
      } else if (intent === 'READ_ALL') {
         readAllSchemes();
      } else {
         // HIGHLIGHT TARGET SCHEME
         if (targetSchemeId) {
            setSpeakingScheme(targetSchemeId);
            const index = activeResults?.findIndex(s => s.id === targetSchemeId) ?? -1;
            if (index !== -1) setCurrentReadIndex(index);
            // Scroll to it
            setTimeout(() => {
               document.getElementById(`scheme-${targetSchemeId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
         }
         
         // Speak the translated detail
         if (spokenResponse) {
            speakResponse(spokenResponse);
         }
      }

    } catch (error) {
      console.error("Chat Error:", error);
    } finally {
      if (recognitionState === 'PROCESSING') {
        setRecognitionState('IDLE');
      }
    }
  };

  const handleManualSubmit = () => {
    if (isListening) {
      submitListening();
    } else if (transcript.trim()) {
      setRecognitionState('PROCESSING');
      handleSubmit(transcript);
    }
  };

  useEffect(() => {
    if (voiceManager) {
      voiceManager.changeLanguage(currentLang);
    }
  }, [currentLang]);

  // Synchronize the current page with the speaking scheme's index
  useEffect(() => {
    if (currentReadIndex !== -1 && results && results.length > 0) {
      const page = Math.floor(currentReadIndex / 10) + 1;
      setCurrentPage(page);
    }
  }, [currentReadIndex, results]);

  const speakResponse = (text: string, langOverride?: string) => {
    if (!voiceManager) return;
    setRecognitionState('SPEAKING');
    
    voiceManager.speak(
      text,
      langOverride || currentLang,
      () => setIsPlaying(true),
      () => {
        setIsPlaying(false);
        setRecognitionState('IDLE');
      }
    );
  };

  /** Translates an array of text chunks via Google Translate for the current language */
  const translateChunks = async (chunks: string[], lang: string): Promise<string[]> => {
    if (lang === 'en-IN') return chunks;
    try {
      const langCode = lang.split('-')[0];
      const ttsLang = ['brx', 'ks', 'mni', 'sat', 'doi', 'mai', 'kok'].includes(langCode) ? 'hi' : langCode;
      const delimiter = ' ___ ';
      const joined = chunks.join(delimiter);
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${ttsLang}&dt=t&q=${encodeURIComponent(joined)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`GT ${res.status}`);
      const data = await res.json();
      const translated: string = data?.[0]?.map((x: any) => x[0]).join('') || '';
      const parts = translated.split(/\s*___\s*/);
      return chunks.map((c, i) => parts[i]?.trim() || c);
    } catch (e) {
      console.warn('[TTS] Chunk translation failed, speaking in English:', e);
      return chunks;
    }
  };

  const playTTS = async (scheme: any, index: number) => {
    if (!voiceManager) return;
    if (speakingScheme === scheme.id && isPlaying) {
      pauseTTS();
      return;
    }
    if (speakingScheme === scheme.id && !isPlaying) {
      resumeTTS();
      return;
    }
    
    setRecognitionState('SPEAKING');
    const t = TRANSLATIONS[currentLang] || TRANSLATIONS['en-IN'];
    
    // Build English chunks first (reason is already translated by match-schemes API)
    const rawChunks = [
      `${scheme.name}.`,
      `${cleanHtmlText(scheme.description)}.`,
      `${t.benefits || 'Benefits'}: ${cleanHtmlText(scheme.benefits)}.`,
      `${t.whyQualify || 'Why you qualify'}: ${scheme.matchDetails.reason}.`,
      `${t.requiredDocs || 'Required Documents'}: ${scheme.required_documents?.join(', ')}.`
    ];

    // Translate scheme text (description, benefits, docs) to the selected language
    const textChunks = await translateChunks(rawChunks, currentLang);
    
    voiceManager.speak(
      textChunks,
      currentLang,
      () => {
        setIsPlaying(true);
        setSpeakingScheme(scheme.id);
        setCurrentReadIndex(index);
      },
      () => {
        setIsPlaying(false);
        setSpeakingScheme(null);
        setRecognitionState('IDLE');
      }
    );
  };

  const readAllSchemes = async () => {
    if (!results || results.length === 0 || !voiceManager) return;
    
    setRecognitionState('SPEAKING');
    const t = TRANSLATIONS[currentLang] || TRANSLATIONS['en-IN'];
    
    const allChunksRaw: string[] = [];
    results.forEach((scheme: any) => {
      allChunksRaw.push(`${scheme.name}.`);
      allChunksRaw.push(`${cleanHtmlText(scheme.description)}.`);
      allChunksRaw.push(`${t.benefits || 'Benefits'}: ${cleanHtmlText(scheme.benefits)}.`);
      allChunksRaw.push(`${t.whyQualify || 'Why you qualify'}: ${scheme.matchDetails.reason}.`);
      allChunksRaw.push(`${t.requiredDocs || 'Required Documents'}: ${scheme.required_documents?.join(', ')}.`);
    });

    // Translate all chunks to the selected language
    const allChunks = await translateChunks(allChunksRaw, currentLang);
    
    voiceManager.speak(
      allChunks,
      currentLang,
      () => {
        setIsPlaying(true);
        setSpeakingScheme(null);
      },
      () => {
        setIsPlaying(false);
        setRecognitionState('IDLE');
      }
    );
  };

  const nextScheme = () => {
    if (!results || currentReadIndex === -1 || currentReadIndex >= results.length - 1) return;
    playTTS(results[currentReadIndex + 1], currentReadIndex + 1);
  };

  // Always open the original official URL — the page content is already translated
  // by our translation system. Google Translate wrapper was unreliable for gov.in sites.
  const getTranslatedLink = (url: string) => url;

  const prevScheme = () => {
    if (!results || currentReadIndex <= 0) return;
    playTTS(results[currentReadIndex - 1], currentReadIndex - 1);
  };

  const pauseTTS = () => {
    voiceManager?.pause();
    setIsPlaying(false);
  };

  const resumeTTS = () => {
    voiceManager?.resume();
    setIsPlaying(true);
  };

  const stopTTS = () => {
    voiceManager?.stop();
    setIsPlaying(false);
    setSpeakingScheme(null);
    setRecognitionState(prev => prev === 'SPEAKING' ? 'IDLE' : prev);
  };

  const repeatTTS = () => {
    if (currentReadIndex !== -1 && results) {
      playTTS(results[currentReadIndex], currentReadIndex);
    } else if (messages.length > 0) {
      speakResponse(messages[messages.length - 1].content);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="sticky top-0 z-20 flex items-center justify-between p-4 bg-white dark:bg-zinc-900 shadow-sm border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">JanSahayak AI</h1>
        </div>
        <div className="flex items-center gap-2">
          {results && (
            <div className="hidden sm:flex bg-zinc-100 rounded-full p-1 gap-1">
              <Button size="icon" variant="ghost" onClick={prevScheme} className="rounded-full w-8 h-8"><SkipBack className="w-4 h-4" /></Button>
              {isPlaying ? (
                <Button size="icon" variant="ghost" onClick={pauseTTS} className="rounded-full w-8 h-8"><Pause className="w-4 h-4" /></Button>
              ) : (
                <Button size="icon" variant="ghost" onClick={resumeTTS} className="rounded-full w-8 h-8"><Play className="w-4 h-4" /></Button>
              )}
              <Button size="icon" variant="ghost" onClick={stopTTS} className="rounded-full w-8 h-8"><Square className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost" onClick={nextScheme} className="rounded-full w-8 h-8"><SkipForward className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost" onClick={repeatTTS} className="rounded-full w-8 h-8"><Repeat className="w-4 h-4" /></Button>
            </div>
          )}
          <select 
            value={currentLang}
            onChange={(e) => {
              const newLang = e.target.value;
              setCurrentLang(newLang);
              window.history.replaceState(null, '', `?lang=${newLang}`);
            }}
            className="text-sm border border-zinc-200 rounded-full px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {SUPPORTED_LANGUAGES.map(l => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
          <Button variant="outline" size="sm" className="gap-2 rounded-full border-zinc-200" onClick={() => window.location.href = '/'}>
            <T lang={langQuery}>Home</T>
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center p-4 sm:p-8 w-full max-w-3xl mx-auto pb-[300px]">
        {!results && !isProcessing && messages.length === 0 && (
          <div className="w-full space-y-8 flex flex-col items-center text-center mt-12">
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white tracking-tight">
                <T lang={langQuery}>Discover Government Schemes tailored for you.</T>
              </h2>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
                <T lang={langQuery}>Tell us about yourself (age, occupation, state, gender, income) and we will find the best schemes for you.</T>
              </p>
            </div>
            
            {/* Try Asking Section */}
            <div className="flex flex-col items-center space-y-4 mt-8 w-full max-w-2xl mx-auto">
              <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider"><T lang={langQuery}>Try asking:</T></p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  { text: 'I am a farmer from Andhra Pradesh.', icon: '🌾' },
                  { text: 'I am a college student from Telangana.', icon: '🎓' },
                  { text: 'I am a pregnant woman from Karnataka.', icon: '🤰' },
                  { text: 'I am a 68-year-old senior citizen from Kerala.', icon: '👴' },
                ].map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (isListening) {
                        stopListening();
                      }
                      setTranscript(prompt.text);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full text-sm text-zinc-700 dark:text-zinc-300 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <span>{prompt.icon}</span>
                    <span><T lang={langQuery}>{prompt.text}</T></span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Chat History */}
        {messages.length > 0 && (
          <div className="w-full space-y-4 mb-8">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200 dark:border-zinc-700 rounded-bl-none'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
        )}

        {isProcessing && (
          <div className="w-full flex flex-col items-center justify-center my-8 space-y-4">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            <h3 className="text-md font-medium text-zinc-700 dark:text-zinc-300"><T lang={langQuery}>{processingState}</T></h3>
          </div>
        )}

        {/* Results List */}
        {results && (
          <SchemeList
            results={results}
            speakingScheme={speakingScheme}
            isPlaying={isPlaying}
            playTTS={playTTS}
            getTranslatedLink={getTranslatedLink}
            cleanHtmlText={cleanHtmlText}
            langQuery={langQuery}
            T={T}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        )}
        {/* Explicit spacer to prevent footer overlap */}
        <div className="h-64 w-full shrink-0"></div>

      </main>

      {/* Floating Action Bar / Input */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg border-t border-zinc-200 dark:border-zinc-800 flex flex-col items-center">
        
        <div className="relative flex justify-center mb-4">
          {isListening && (
            <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30 rounded-full animate-ping w-24 h-24 m-auto"></div>
          )}
          <button
            onClick={toggleListening}
            className={`relative z-10 flex items-center justify-center w-16 h-16 rounded-full shadow-lg transition-all transform hover:scale-105 active:scale-95 ${
              isListening 
                ? "bg-red-500 text-white shadow-red-500/50" 
                : "bg-blue-600 text-white shadow-blue-600/50"
            }`}
          >
            <Mic className={`w-8 h-8 ${isListening ? "animate-pulse" : ""}`} />
          </button>
        </div>

        <div className="text-sm font-medium text-zinc-500 mb-2 h-5">
          {isListening
            ? <T lang={langQuery}>Listening... Press ➤ or Enter to submit</T>
            : <T lang={langQuery}>Tap to speak, or type below</T>}
        </div>

        <div className="w-full max-w-2xl flex items-center gap-3">
          <Input 
            value={transcript} 
            onChange={(e) => setTranscript(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleManualSubmit();
              }
            }}
            placeholder="Type your query..." 
            className="flex-1 text-lg py-6 rounded-full px-6 shadow-sm border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
          />
          <Button 
            onClick={() => handleManualSubmit()} 
            disabled={!transcript.trim() || recognitionState === 'PROCESSING'}
            size="icon" 
            className="rounded-full bg-blue-600 hover:bg-blue-700 text-white shrink-0 w-12 h-12"
          >
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>

      </div>
    </div>
  );
}

export default function VoiceInterface() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-blue-600"/></div>}>
      <VoiceInterfaceContent />
    </Suspense>
  );
}
