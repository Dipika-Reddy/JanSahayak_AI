"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Mic, Globe, Volume2, ArrowRight, Loader2, CheckCircle2, FileText, MapPin, Square, Play, Pause, SkipBack, SkipForward, Repeat } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SUPPORTED_LANGUAGES, TRANSLATIONS } from "@/lib/translations";
// --- Static Dictionary Translation ---
const T = ({ children, lang }: { children: string, lang: string }) => {
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
    'Likely Eligible': t.likelyEligible
  };

  return <>{stringMap[children] || children}</>;
};

function VoiceInterfaceContent() {
  const searchParams = useSearchParams();
  const langQuery = searchParams.get('lang') || 'en-IN';
  
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingState, setProcessingState] = useState(""); 
  
  const [profile, setProfile] = useState<any>(null);
  const [results, setResults] = useState<any[] | null>(null);
  
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  
  const [speakingScheme, setSpeakingScheme] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const [currentReadIndex, setCurrentReadIndex] = useState(-1);
  
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = langQuery;
        
        recognitionRef.current.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript((prev) => {
             // For continuous mode, we just take the latest interim or final
             // Realistically, we replace the current input line
             return currentTranscript;
          });

          // Reset silence timer: 5 seconds of silence = auto submit
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            if (isListening) {
              recognitionRef.current?.stop();
              setIsListening(false);
              handleSubmit(currentTranscript);
            }
          }, 5000);
        };
        
        recognitionRef.current.onerror = () => setIsListening(false);
        recognitionRef.current.onend = () => setIsListening(false);
      }
    }
  }, [langQuery, isListening]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    } else {
      setTranscript("");
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.error("Speech recognition error:", e);
      }
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
      
      setProfile(profileData.profile);
      setProcessingState("Finding matching schemes...");
      
      const matchRes = await fetch("/api/match-schemes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: profileData.profile, lang: langQuery }),
      });
      const matchData = await matchRes.json();
      if (matchData.error) throw new Error(matchData.error);
      
      setResults(matchData.matches);
      
      const t = TRANSLATIONS[langQuery] || TRANSLATIONS['en-IN'];
      const respText = `${t.foundSchemes1 || 'I found '}${matchData.matches.length}${t.foundSchemes2 || ' schemes for you. You can ask me to read them or ask follow-up questions.'}`;

      setMessages([
        { role: 'user', content: textToSubmit },
        { role: 'assistant', content: respText }
      ]);
      
      speakResponse(respText);

    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Please try again.");
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
          lang: langQuery
        }),
      });
      const chatData = await chatRes.json();
      if (chatData.error) throw new Error(chatData.error);
      
      setMessages([...newMessages, { role: 'assistant', content: chatData.reply }]);
      speakResponse(chatData.reply);

    } catch (error) {
      console.error("Chat Error:", error);
    }
  };

  const handleSubmit = async (overrideText?: string) => {
    const textToSubmit = overrideText || transcript;
    if (!textToSubmit.trim()) return;
    
    setIsProcessing(true);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    
    // Stop any currently playing TTS
    stopTTS();

    // Contextual Routing
    if (!results) {
      await handleInitialSearch(textToSubmit);
    } else {
      // Voice Commands override
      const lower = textToSubmit.toLowerCase();
      if (lower.includes("stop") || lower.includes("stop reading")) {
        stopTTS();
        setMessages(m => [...m, { role: 'user', content: textToSubmit }, { role: 'assistant', content: 'Stopped.' }]);
        setIsProcessing(false);
        setTranscript("");
        return;
      } else if (lower.includes("read all") || lower.includes("read schemes")) {
        readAllSchemes();
        setMessages(m => [...m, { role: 'user', content: textToSubmit }, { role: 'assistant', content: 'Reading schemes...' }]);
        setIsProcessing(false);
        setTranscript("");
        return;
      } else if (lower.includes("next scheme")) {
        nextScheme();
        setMessages(m => [...m, { role: 'user', content: textToSubmit }, { role: 'assistant', content: 'Next scheme.' }]);
        setIsProcessing(false);
        setTranscript("");
        return;
      } else if (lower.includes("previous scheme")) {
        prevScheme();
        setMessages(m => [...m, { role: 'user', content: textToSubmit }, { role: 'assistant', content: 'Previous scheme.' }]);
        setIsProcessing(false);
        setTranscript("");
        return;
      } else if (lower.includes("pause")) {
        pauseTTS();
        setMessages(m => [...m, { role: 'user', content: textToSubmit }, { role: 'assistant', content: 'Paused.' }]);
        setIsProcessing(false);
        setTranscript("");
        return;
      } else if (lower.includes("continue") || lower.includes("resume") || lower.includes("play")) {
        resumeTTS();
        setMessages(m => [...m, { role: 'user', content: textToSubmit }, { role: 'assistant', content: 'Resuming.' }]);
        setIsProcessing(false);
        setTranscript("");
        return;
      }

      await handleFollowUpChat(textToSubmit);
    }
    
    setIsProcessing(false);
    setTranscript("");
  };

  // --- Voice Controls ---
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      // Trigger voice loading early
      window.speechSynthesis.getVoices();
    }
  }, []);

  const setUtteranceVoice = (utterance: SpeechSynthesisUtterance, targetLang: string) => {
    const voices = window.speechSynthesis.getVoices();
    const shortLang = targetLang.split('-')[0];
    
    let voice = voices.find(v => v.lang === targetLang || v.lang.replace('_', '-') === targetLang);
    if (!voice) voice = voices.find(v => v.lang.startsWith(shortLang));
    if (!voice) {
      const names: Record<string, string> = { 'te': 'Telugu', 'hi': 'Hindi', 'ta': 'Tamil', 'mr': 'Marathi', 'bn': 'Bengali' };
      if (names[shortLang]) voice = voices.find(v => v.name.toLowerCase().includes(names[shortLang].toLowerCase()));
    }
    
    if (voice) utterance.voice = voice;
    utterance.lang = targetLang;
  };

  const speakResponse = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    setUtteranceVoice(utterance, langQuery);
    utterance.onend = () => setIsPlaying(false);
    utterance.onstart = () => setIsPlaying(true);
    setCurrentUtterance(utterance);
    window.speechSynthesis.speak(utterance);
  };

  const playTTS = (scheme: any, index: number) => {
    if (speakingScheme === scheme.id && isPlaying) {
      pauseTTS();
      return;
    }
    if (speakingScheme === scheme.id && !isPlaying) {
      resumeTTS();
      return;
    }
    
    window.speechSynthesis.cancel();
    const t = TRANSLATIONS[langQuery] || TRANSLATIONS['en-IN'];
    const text = `${scheme.name}. ${scheme.description}. ${t.benefits}: ${scheme.benefits}. ${t.whyQualify}: ${scheme.matchDetails.reason}. ${t.requiredDocs}: ${scheme.required_documents?.join(', ')}.`;
    const utterance = new SpeechSynthesisUtterance(text);
    setUtteranceVoice(utterance, langQuery);
    utterance.onend = () => {
      setIsPlaying(false);
      setSpeakingScheme(null);
    };
    utterance.onstart = () => {
      setIsPlaying(true);
      setSpeakingScheme(scheme.id);
      setCurrentReadIndex(index);
    };
    setCurrentUtterance(utterance);
    window.speechSynthesis.speak(utterance);
  };

  const readAllSchemes = () => {
    if (!results || results.length === 0) return;
    playTTS(results[0], 0);
  };

  const nextScheme = () => {
    if (!results || currentReadIndex === -1 || currentReadIndex >= results.length - 1) return;
    playTTS(results[currentReadIndex + 1], currentReadIndex + 1);
  };

  const getTranslatedLink = (url: string) => {
    if (langQuery === 'en' || langQuery === 'en-IN') return url;
    const langCode = langQuery.split('-')[0]; // convert en-IN to en, hi-IN to hi
    return `https://translate.google.com/translate?sl=en&tl=${langCode}&u=${encodeURIComponent(url)}`;
  };

  const prevScheme = () => {
    if (!results || currentReadIndex <= 0) return;
    playTTS(results[currentReadIndex - 1], currentReadIndex - 1);
  };

  const pauseTTS = () => {
    window.speechSynthesis.pause();
    setIsPlaying(false);
  };

  const resumeTTS = () => {
    window.speechSynthesis.resume();
    setIsPlaying(true);
  };

  const stopTTS = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setSpeakingScheme(null);
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
            value={langQuery}
            onChange={(e) => window.location.href = `?lang=${e.target.value}`}
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
          <div className="w-full space-y-6 mt-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold"><T lang={langQuery}>Eligible Schemes</T></h2>
            </div>
            
            {results.length === 0 ? (
              <p className="text-zinc-500"><T lang={langQuery}>No matching schemes found for this profile.</T></p>
            ) : (
              results.map((scheme, i) => (
                <Card key={scheme.id || i} className={`overflow-hidden border-zinc-200 dark:border-zinc-800 transition-all ${speakingScheme === scheme.id ? 'ring-2 ring-blue-500 shadow-md' : ''}`}>
                  <CardHeader className="bg-zinc-50 dark:bg-zinc-900/50 pb-4">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <CardTitle className="text-xl text-blue-700 dark:text-blue-400">{scheme.name}</CardTitle>
                        <CardDescription className="mt-1 text-sm">{scheme.description}</CardDescription>
                      </div>
                      <Badge className={
                        scheme.matchDetails.eligibility === 'Eligible' || scheme.matchDetails.eligibility === 'पात्र' || scheme.matchDetails.eligibility === 'அர்ஹులు' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                        scheme.matchDetails.eligibility === 'Not Eligible' || scheme.matchDetails.eligibility === 'अपात्र' ? 'bg-red-100 text-red-800 hover:bg-red-100' :
                        'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                      }>
                        {scheme.matchDetails.eligibility}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <div className="flex gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium"><T lang={langQuery}>Why you qualify</T></p>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">{scheme.matchDetails.reason}</p>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-medium text-blue-900 dark:text-blue-200"><T lang={langQuery}>Benefits</T></p>
                        <p className="text-sm text-blue-800 dark:text-blue-300">{scheme.benefits}</p>
                      </div>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className={`rounded-full shrink-0 ${speakingScheme === scheme.id ? 'text-red-600 bg-red-100' : 'text-blue-600'}`}
                        onClick={() => playTTS(scheme, i)}
                      >
                        {speakingScheme === scheme.id && isPlaying ? <Square className="w-5 h-5 fill-current" /> : <Volume2 className="w-5 h-5" />}
                      </Button>
                    </div>

                    <div>
                      <p className="font-medium flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-zinc-500" /> 
                        <T lang={langQuery}>Required Documents</T>
                      </p>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {scheme.required_documents?.map((doc: string, idx: number) => (
                          <li key={idx} className="text-sm flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 rounded border border-zinc-100 dark:border-zinc-800">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                            <T lang={langQuery}>{doc}</T>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-zinc-50 dark:bg-zinc-900/50 flex flex-col sm:flex-row gap-3 pt-4">
                    <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700" onClick={() => window.open(getTranslatedLink(scheme.application_link), '_blank')}>
                      <T lang={langQuery}>Apply Online</T>
                    </Button>
                    <Button variant="outline" className="w-full sm:w-auto gap-2" onClick={() => window.open('https://www.google.com/maps/search/MeeSeva+or+CSC+center+near+me', '_blank')}>
                      <MapPin className="w-4 h-4" />
                      <T lang={langQuery}>Find Nearby Center</T>
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
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
          {isListening ? <T lang={langQuery}>Listening (will auto-submit when you stop speaking)...</T> : <T lang={langQuery}>Tap to speak, or type below</T>}
        </div>

        <div className="w-full max-w-2xl flex items-center gap-3">
          <Input 
            value={transcript} 
            onChange={(e) => setTranscript(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
                handleSubmit();
              }
            }}
            placeholder="Type your query..." 
            className="flex-1 text-lg py-6 rounded-full px-6 shadow-sm border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
          />
          <Button 
            onClick={() => handleSubmit()} 
            disabled={!transcript.trim()}
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
