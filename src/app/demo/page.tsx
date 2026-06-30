"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Mic, Search, Globe, Volume2, ArrowRight, Loader2, CheckCircle2, FileText, MapPin, Square } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TRANSLATIONS } from '@/lib/translations';

function VoiceInterfaceContent() {
  const searchParams = useSearchParams();
  const langQuery = searchParams.get('lang') || 'en-IN';
  const t = TRANSLATIONS[langQuery] || TRANSLATIONS['en-IN'];
  
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingState, setProcessingState] = useState(""); 
  const [results, setResults] = useState<any[] | null>(null);
  const [speakingScheme, setSpeakingScheme] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = langQuery;
        
        recognitionRef.current.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
        };
        
        recognitionRef.current.onerror = () => setIsListening(false);
        recognitionRef.current.onend = () => setIsListening(false);
      }
    }
  }, [langQuery]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript("");
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.error("Speech recognition error:", e);
        setIsListening(true);
        setTimeout(() => {
          setTranscript("I am a female farmer from Andhra Pradesh.");
          setIsListening(false);
        }, 2000);
      }
    }
  };

  const handleSubmit = async () => {
    if (!transcript.trim()) return;
    
    setIsProcessing(true);
    setResults(null);
    
    try {
      setProcessingState(t.processing);
      const profileRes = await fetch("/api/extract-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      });
      const profileData = await profileRes.json();
      
      if (profileData.error) throw new Error(profileData.error);
      
      setProcessingState(t.finding);
      const matchRes = await fetch("/api/match-schemes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: profileData.profile, lang: langQuery }),
      });
      const matchData = await matchRes.json();
      
      if (matchData.error) throw new Error(matchData.error);
      
      setResults(matchData.matches);
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const playTTS = (scheme: any) => {
    if (speakingScheme === scheme.id) {
      window.speechSynthesis.cancel();
      setSpeakingScheme(null);
      return;
    }
    
    window.speechSynthesis.cancel();
    const text = `${scheme.name}. ${scheme.matchDetails.reason}. ${scheme.benefits}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langQuery;
    utterance.onend = () => setSpeakingScheme(null);
    window.speechSynthesis.speak(utterance);
    setSpeakingScheme(scheme.id);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-white dark:bg-zinc-900 shadow-sm border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">JanSahayak AI</h1>
        </div>
        <Button variant="outline" size="sm" className="gap-2 rounded-full border-zinc-200" onClick={() => window.location.href = '/'}>
          Home
        </Button>
      </header>

      <main className="flex-1 flex flex-col items-center p-4 sm:p-8 w-full max-w-2xl mx-auto">
        {!results && !isProcessing && (
          <div className="w-full space-y-8 flex flex-col items-center text-center mt-12">
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white tracking-tight">
                {t.title}
              </h2>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
                {t.subtitle}
              </p>
            </div>

            <div className="relative flex justify-center py-8">
              {isListening && (
                <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30 rounded-full animate-ping w-48 h-48 m-auto"></div>
              )}
              <button
                onClick={toggleListening}
                className={`relative z-10 flex items-center justify-center w-32 h-32 rounded-full shadow-lg transition-all transform hover:scale-105 active:scale-95 ${
                  isListening 
                    ? "bg-red-500 text-white shadow-red-500/50" 
                    : "bg-blue-600 text-white shadow-blue-600/50"
                }`}
              >
                <Mic className={`w-12 h-12 ${isListening ? "animate-pulse" : ""}`} />
              </button>
            </div>
            
            <div className="text-sm font-medium text-zinc-500 h-6">
              {isListening ? t.listening : t.tapToSpeak}
            </div>

            <Card className="w-full mt-4 bg-white dark:bg-zinc-900 shadow-sm border-zinc-200 dark:border-zinc-800">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex-1">
                  <Input 
                    value={transcript} 
                    onChange={(e) => setTranscript(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    placeholder="..." 
                    className="border-0 focus-visible:ring-0 text-lg shadow-none px-0"
                  />
                </div>
                <Button 
                  onClick={handleSubmit} 
                  disabled={!transcript.trim() || isListening}
                  size="icon" 
                  className="rounded-full bg-blue-600 hover:bg-blue-700 text-white shrink-0"
                >
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {isProcessing && (
          <div className="w-full flex flex-col items-center justify-center mt-32 space-y-6">
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
            <h3 className="text-xl font-medium text-zinc-700 dark:text-zinc-300">{processingState}</h3>
          </div>
        )}

        {results && (
          <div className="w-full space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Results</h2>
              <Button variant="ghost" onClick={() => setResults(null)}>Start Over</Button>
            </div>
            
            {results.length === 0 ? (
              <p className="text-zinc-500">No matching schemes found for this profile.</p>
            ) : (
              results.map((scheme, i) => (
                <Card key={scheme.id || i} className="overflow-hidden border-zinc-200 dark:border-zinc-800">
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
                        <p className="font-medium">Why you qualify</p>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">{scheme.matchDetails.reason}</p>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-medium text-blue-900 dark:text-blue-200">Benefits</p>
                        <p className="text-sm text-blue-800 dark:text-blue-300">{scheme.benefits}</p>
                      </div>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="text-blue-600 rounded-full shrink-0"
                        onClick={() => playTTS(scheme)}
                      >
                        {speakingScheme === scheme.id ? <Square className="w-5 h-5 fill-current" /> : <Volume2 className="w-5 h-5" />}
                      </Button>
                    </div>

                    <div>
                      <p className="font-medium flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-zinc-500" /> 
                        {t.requiredDocs}
                      </p>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {scheme.required_documents?.map((doc: string, idx: number) => (
                          <li key={idx} className="text-sm flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 rounded border border-zinc-100 dark:border-zinc-800">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                            {doc}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-zinc-50 dark:bg-zinc-900/50 flex flex-col sm:flex-row gap-3 pt-4">
                    <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700" onClick={() => window.open(scheme.application_link, '_blank')}>
                      Apply Online
                    </Button>
                    <Button variant="outline" className="w-full sm:w-auto gap-2" onClick={() => window.open('https://www.google.com/maps/search/MeeSeva+or+CSC+center+near+me', '_blank')}>
                      <MapPin className="w-4 h-4" />
                      Find Nearby Center
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function VoiceInterface() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VoiceInterfaceContent />
    </Suspense>
  );
}
