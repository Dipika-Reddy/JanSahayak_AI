"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Mic, Globe, Search, ArrowRight, ShieldCheck, Banknote, MapPin, Users, Check } from "lucide-react";
import { SUPPORTED_LANGUAGES, TRANSLATIONS } from "@/lib/translations";
import { motion, useScroll, useTransform } from "framer-motion";

export default function LandingPage() {
  const [selectedLang, setSelectedLang] = useState('en-IN');
  const [dynamicTranslations, setDynamicTranslations] = useState<Record<string, string>>({});
  const [isTranslating, setIsTranslating] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const LANDING_KEYS = [
    'tryLiveDemo',
    'heroTag',
    'heroTitlePart1',
    'heroTitlePart2',
    'heroDesc',
    'exploreSolution',
    'mapTitle',
    'mapDesc',
    'vaActive',
    'listeningIn',
    'infoGapTitle',
    'infoGapDesc',
    'langBarrier',
    'langBarrierDesc',
    'discIssue',
    'discIssueDesc',
    'digLit',
    'digLitDesc',
    'hiwTitle',
    'hiwDesc',
    'step1Title',
    'step1Desc',
    'step2Title',
    'step2Desc',
    'step3Title',
    'step3Desc',
    'tryYourself'
  ];

  // Dynamically translate homepage UI when a language other than standard ones is chosen
  useEffect(() => {
    const translateUI = async () => {
      // Statically supported languages are en-IN, hi-IN, te-IN, ta-IN (MR and BN have missing landing page translations, so they translate dynamically)
      const isStatic = ['en-IN', 'hi-IN', 'te-IN', 'ta-IN'].includes(selectedLang);
      if (!isStatic) {
        // Check local storage cache first
        const cacheKey = `trans_landing_v2_${selectedLang}`;
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
          const texts = LANDING_KEYS.map(key => TRANSLATIONS['en-IN'][key]);
          const res = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ texts, targetLang: selectedLang })
          });
          const data = await res.json();
          if (data.translations) {
            // Map the translated texts back to the original keys
            const mapped: Record<string, string> = {};
            LANDING_KEYS.forEach(key => {
              const englishText = TRANSLATIONS['en-IN'][key];
              mapped[key] = data.translations[englishText] || englishText;
            });
            setDynamicTranslations(mapped);
            localStorage.setItem(cacheKey, JSON.stringify(mapped));
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
  }, [selectedLang]);

  // Merge static translations and dynamic translations
  const t = {
    ...(TRANSLATIONS[selectedLang] || TRANSLATIONS['en-IN']),
    ...dynamicTranslations
  };
  
  // Parallax effect for hero background
  const { scrollY } = useScroll();
  const yBg = useTransform(scrollY, [0, 1000], [0, 300]);

  return (
    <div className="min-h-screen bg-[#080E1C] text-slate-100 font-sans selection:bg-blue-600/30 overflow-hidden">
      
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 w-full border-b border-blue-900/40 bg-[#080E1C]/85 backdrop-blur-xl"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="bg-gradient-to-br from-blue-500 to-blue-800 p-1.5 rounded-xl shadow-[0_4px_15px_rgba(37,99,235,0.4)]">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">JanSahayak<span className="text-blue-400">.AI</span></span>
            </div>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-1">
              {[
                { label: 'Home', href: '#hero' },
                { label: 'Impact Map', href: '#impact-map' },
                { label: 'Why JanSahayak', href: '#why' },
                { label: 'Architecture', href: '#architecture' },
                { label: 'How It Works', href: '#how-it-works' },
              ].map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2 rounded-full text-sm font-medium text-slate-300 hover:text-white hover:bg-blue-800/30 transition-all"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Right side: lang picker + CTA + mobile hamburger */}
            <div className="flex items-center gap-3">
              <select 
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                className="text-sm border border-blue-900/50 rounded-full px-3 py-1.5 bg-blue-950/60 text-slate-100 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map(l => (
                  <option key={l.code} value={l.code} className="bg-slate-900 text-slate-100">{l.label}</option>
                ))}
              </select>

              <Link 
                href={`/demo?lang=${selectedLang}`}
                className="hidden sm:inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-blue-800 px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_20px_rgba(37,99,235,0.35)] hover:shadow-[0_4px_30px_rgba(37,99,235,0.55)] transition-all hover:scale-105 active:scale-95"
              >
                {t.tryLiveDemo}
              </Link>

              {/* Mobile hamburger */}
              <button
                className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-blue-900/30 transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                <span className={`block w-5 h-0.5 bg-slate-300 transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                <span className={`block w-5 h-0.5 bg-slate-300 transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
                <span className={`block w-5 h-0.5 bg-slate-300 transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
              </button>
            </div>
          </div>

          {/* Mobile dropdown menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="md:hidden py-4 border-t border-blue-900/30 flex flex-col gap-1"
            >
              {[
                { label: 'Home', href: '#hero' },
                { label: 'Impact Map', href: '#impact-map' },
                { label: 'Why JanSahayak', href: '#why' },
                { label: 'Architecture', href: '#architecture' },
                { label: 'How It Works', href: '#how-it-works' },
              ].map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-blue-800/30 transition-all"
                >
                  {link.label}
                </a>
              ))}
              <Link
                href={`/demo?lang=${selectedLang}`}
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2 w-full text-center rounded-full bg-gradient-to-r from-blue-600 to-blue-800 px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_20px_rgba(37,99,235,0.3)] transition-all"
              >
                {t.tryLiveDemo}
              </Link>
            </motion.div>
          )}
        </div>
      </motion.nav>

      {/* Spacer to push content down when navigation is fixed */}
      <div className="h-16 w-full shrink-0"></div>

      <main>
        {/* Hero Section */}
        <section id="hero" className="relative pt-10 pb-16 overflow-hidden">
          {/* Animated Background Mesh */}
          <motion.div 
            style={{ y: yBg }}
            className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-10" 
          />
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-700/20 rounded-full blur-[120px] -z-10 pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-blue-900/15 rounded-full blur-[150px] -z-10 pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              
              {/* Hero Text */}
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="max-w-2xl"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-600/10 border border-blue-600/30 text-blue-300 text-sm font-semibold mb-6 shadow-[0_2px_15px_rgba(37,99,235,0.15)]">
                  <span className="flex h-2 w-2 rounded-full bg-blue-400 animate-pulse"></span>
                  {t.heroTag}
                </div>
                <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
                  {t.heroTitlePart1} <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-blue-500 to-indigo-500">
                    {t.heroTitlePart2}
                  </span>
                </h1>
                <p className="text-xl text-zinc-400 mb-10 leading-relaxed font-light">
                  {t.heroDesc}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-5">
                  <Link 
                    href={`/demo?lang=${selectedLang}`}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-4 text-base font-bold text-white shadow-[0_4px_30px_rgba(37,99,235,0.4)] hover:shadow-[0_4px_40px_rgba(37,99,235,0.6)] hover:scale-105 active:scale-95 transition-all"
                  >
                    {t.tryLiveDemo} <ArrowRight className="w-5 h-5" />
                  </Link>
                  <a 
                    href="#how-it-works" 
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-zinc-900/50 px-8 py-4 text-base font-semibold text-zinc-300 shadow-sm ring-1 ring-inset ring-zinc-700 hover:bg-zinc-800 hover:text-white transition-all backdrop-blur-sm"
                  >
                    {t.exploreSolution}
                  </a>
                </div>
              </motion.div>

              {/* Hero Visual / Dashboard Preview */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="relative mx-auto w-full max-w-lg lg:max-w-none"
              >
                <div className="relative rounded-2xl bg-[#0d1730] shadow-2xl shadow-blue-900/30 ring-1 ring-blue-900/40 p-2 overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-700/10 to-indigo-700/10 opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
                  
                  {/* Mock Dashboard UI */}
                  <div className="relative bg-[#070d1a] rounded-xl border border-blue-900/40 shadow-inner overflow-hidden flex flex-col h-[520px]">
                    <div className="border-b border-blue-900/30 p-4 bg-blue-950/30 flex justify-between items-center backdrop-blur-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center ring-1 ring-blue-600/40">
                          <Mic className="w-5 h-5 text-blue-300" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-zinc-100">{t.vaActive}</p>
                          <p className="text-xs text-blue-300/80">{t.listeningIn}</p>
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse delay-75"></div>
                        <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse delay-150"></div>
                      </div>
                    </div>
                    
                    <div className="flex-1 p-6 space-y-6 overflow-hidden relative">
                       {/* Chat Bubbles */}
                       <motion.div 
                         initial={{ opacity: 0, x: -20 }}
                         animate={{ opacity: 1, x: 0 }}
                         transition={{ delay: 1 }}
                         className="flex gap-4"
                       >
                         <div className="w-8 h-8 rounded-full bg-zinc-800 flex-shrink-0 ring-1 ring-zinc-700"></div>
                         <div className="bg-zinc-800 rounded-2xl rounded-tl-none px-4 py-3 text-sm text-zinc-300 max-w-[80%] border border-zinc-700/50">
                           "I am a female farmer from Andhra Pradesh. What schemes am I eligible for?"
                         </div>
                       </motion.div>
                       
                       <motion.div 
                         initial={{ opacity: 0, x: 20 }}
                         animate={{ opacity: 1, x: 0 }}
                         transition={{ delay: 2.5 }}
                         className="flex gap-4 flex-row-reverse"
                       >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-800 flex items-center justify-center flex-shrink-0 shadow-[0_2px_10px_rgba(37,99,235,0.5)]">
                            <Globe className="w-4 h-4 text-white" />
                          </div>
                          <div className="bg-gradient-to-r from-blue-700/20 to-blue-900/20 text-blue-50 rounded-2xl rounded-tr-none px-4 py-3 text-sm max-w-[80%] shadow-md border border-blue-600/30 backdrop-blur-md">
                           I found 2 schemes for you based on your profile as a female farmer in Andhra Pradesh.
                         </div>
                       </motion.div>

                       {/* Mock Scheme Card */}
                       <motion.div 
                         initial={{ opacity: 0, y: 20 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ delay: 3.5 }}
                         className="mt-4 ml-12 border border-zinc-800 rounded-xl p-4 bg-zinc-900/80 shadow-lg backdrop-blur-md"
                       >
                          <div className="flex items-center gap-2 mb-2">
                            <Banknote className="w-4 h-4 text-emerald-400" />
                            <span className="font-semibold text-sm text-zinc-100">PM Kisan Samman Nidhi</span>
                          </div>
                          <p className="text-xs text-zinc-400 mb-3">₹6,000 per year minimum income support for farmers.</p>
                          <div className="flex gap-2">
                             <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-400 ring-1 ring-inset ring-emerald-500/20">Eligible</span>
                             <span className="inline-flex items-center rounded-md bg-blue-600/10 px-2 py-1 text-xs font-semibold text-blue-300 ring-1 ring-inset ring-blue-600/20">Agriculture</span>
                          </div>
                       </motion.div>
                       
                       {/* Gradient fade at bottom to simulate scroll */}
                       <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-zinc-950 to-transparent"></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Impact Map Section */}
        <section id="impact-map" className="py-24 bg-[#0a1225] border-y border-blue-900/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#080E1C] via-transparent to-[#080E1C] z-10 pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-700/10 border border-blue-700/30 text-blue-300 text-sm font-semibold mb-4">
                <MapPin className="w-4 h-4" />
                Targeting Ground Zero
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl mb-6">{t.mapTitle || 'Identifying Needs Across India'}</h2>
              <p className="text-xl text-slate-400 font-light">{t.mapDesc || 'Targeting regions with low digital literacy and high dependency on agricultural welfare.'}</p>
            </motion.div>

            <div className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden bg-blue-950/20 border border-blue-900/30 shadow-[0_8px_50px_rgba(37,99,235,0.1)] p-8">
              <div className="relative aspect-[4/3] w-full max-w-2xl mx-auto">
                {/* Background Map Image */}
                <img src="/india-map-neon.png" alt="India Map Outline" className="w-full h-full object-contain opacity-80 mix-blend-screen" />
                
                {/* Interactive Pins */}
                {/* UP/Bihar Region */}
                <div className="absolute top-[42%] left-[56%] group">
                  <div className="relative flex items-center justify-center cursor-pointer">
                    <div className="w-4 h-4 bg-blue-500 rounded-full animate-ping absolute"></div>
                    <div className="w-3 h-3 bg-blue-400 rounded-full relative z-10 shadow-[0_2px_10px_rgba(37,99,235,0.7)]"></div>
                  </div>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-48 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-[#0a1225] border border-blue-700/30 rounded-xl p-3 shadow-[0_4px_20px_rgba(37,99,235,0.2)] z-30">
                    <p className="text-white font-bold text-sm mb-1">Uttar Pradesh & Bihar</p>
                    <p className="text-xs text-slate-400">Literacy: 67%</p>
                    <p className="text-xs text-blue-300 mt-1">High Need: PM Kisan, Ration Cards</p>
                  </div>
                </div>

                {/* Central India */}
                <div className="absolute top-[50%] left-[45%] group">
                  <div className="relative flex items-center justify-center cursor-pointer">
                    <div className="w-4 h-4 bg-indigo-500 rounded-full animate-ping absolute delay-150"></div>
                    <div className="w-3 h-3 bg-indigo-400 rounded-full relative z-10 shadow-[0_2px_10px_rgba(99,102,241,0.7)]"></div>
                  </div>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-48 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-[#0a1225] border border-indigo-700/30 rounded-xl p-3 shadow-[0_4px_20px_rgba(99,102,241,0.2)] z-30">
                    <p className="text-white font-bold text-sm mb-1">Madhya Pradesh</p>
                    <p className="text-xs text-slate-400">Literacy: 69%</p>
                    <p className="text-xs text-indigo-300 mt-1">High Need: Crop Insurance</p>
                  </div>
                </div>

                {/* Northeast */}
                <div className="absolute top-[45%] left-[70%] group">
                  <div className="relative flex items-center justify-center cursor-pointer">
                    <div className="w-4 h-4 bg-emerald-500 rounded-full animate-ping absolute delay-300"></div>
                    <div className="w-3 h-3 bg-emerald-400 rounded-full relative z-10 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
                  </div>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-48 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-slate-950 border border-emerald-500/30 rounded-xl p-3 shadow-[0_0_20px_rgba(16,185,129,0.2)] z-30">
                    <p className="text-white font-bold text-sm mb-1">Assam</p>
                    <p className="text-xs text-slate-400">Literacy: 72%</p>
                    <p className="text-xs text-emerald-400 mt-1">High Need: Tea Worker Schemes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats / Value Prop Section */}
        <section id="why" className="py-24 bg-blue-950/10 border-y border-blue-900/20 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="text-center max-w-3xl mx-auto mb-20"
            >
              <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl mb-6">{t.infoGapTitle}</h2>
              <p className="text-xl text-zinc-400 font-light">{t.infoGapDesc}</p>
            </motion.div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: 0.1 }}
                className="bg-[#0d1730] rounded-3xl p-8 border border-blue-900/30 text-center hover:border-blue-600/40 transition-colors group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="mx-auto w-14 h-14 bg-blue-950/50 rounded-2xl flex items-center justify-center mb-8 ring-1 ring-blue-900/50 group-hover:ring-blue-500/50 group-hover:shadow-[0_2px_20px_rgba(37,99,235,0.2)] transition-all">
                    <Globe className="w-7 h-7 text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{t.langBarrier}</h3>
                  <p className="text-zinc-400 leading-relaxed">{t.langBarrierDesc}</p>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: 0.2 }}
                className="bg-[#0d1730] rounded-3xl p-8 border border-blue-900/30 text-center hover:border-indigo-600/40 transition-colors group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="mx-auto w-14 h-14 bg-blue-950/50 rounded-2xl flex items-center justify-center mb-8 ring-1 ring-blue-900/50 group-hover:ring-indigo-500/50 group-hover:shadow-[0_2px_20px_rgba(99,102,241,0.2)] transition-all">
                    <Search className="w-7 h-7 text-indigo-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{t.discIssue}</h3>
                  <p className="text-zinc-400 leading-relaxed">{t.discIssueDesc}</p>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: 0.3 }}
                className="bg-[#0d1730] rounded-3xl p-8 border border-blue-900/30 text-center hover:border-blue-500/40 transition-colors group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="mx-auto w-14 h-14 bg-blue-950/50 rounded-2xl flex items-center justify-center mb-8 ring-1 ring-blue-900/50 group-hover:ring-blue-500/50 group-hover:shadow-[0_2px_20px_rgba(37,99,235,0.2)] transition-all">
                    <Users className="w-7 h-7 text-blue-300" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{t.digLit}</h3>
                  <p className="text-zinc-400 leading-relaxed">{t.digLitDesc}</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Project Mind Map Section (Moved Above How It Works) */}
        <section id="architecture" className="py-24 bg-[#080E1C] border-t border-blue-900/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-[#080E1C] to-[#080E1C] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl mb-4">Project Mind Map</h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">A comprehensive overview of the JanSahayak AI architecture, workflow, and social impact.</p>
            </motion.div>

            {/* Mind Map Container */}
            <div className="relative max-w-5xl mx-auto flex flex-col items-center">
              
              {/* Central Node */}
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                className="bg-[#0d1730] border-2 border-blue-600/40 rounded-2xl p-6 text-center shadow-[0_4px_30px_rgba(37,99,235,0.2)] z-20 relative cursor-default"
              >
                <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-800 rounded-xl flex items-center justify-center mb-3">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">JanSahayak AI</h3>
                <p className="text-sm text-blue-300 mt-1 font-semibold">AI-powered Multilingual Welfare Platform</p>
              </motion.div>

              {/* Vertical connecting line */}
              <motion.div 
                initial={{ height: 0 }}
                whileInView={{ height: 48 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-px bg-gradient-to-b from-blue-600/50 to-blue-900/30"
              ></motion.div>

              {/* Grid of 6 main nodes */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full relative">
                {/* Horizontal connecting line behind grid on desktop */}
                <motion.div 
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="hidden lg:block absolute top-0 left-1/6 right-1/6 h-px bg-slate-700 -z-10 origin-center"
                ></motion.div>

                {/* Node 1: Problem */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", delay: 0.4 }}
                  className="bg-slate-900/80 border border-slate-700 rounded-xl p-5 hover:border-red-500/50 hover:shadow-[0_10px_30px_rgba(239,68,68,0.15)] transition-all group"
                >
                  <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 group-hover:shadow-[0_0_10px_rgba(239,68,68,0.8)]"></span>
                    The Problem
                  </h4>
                  <ul className="text-sm text-slate-400 space-y-2">
                    <li>• Low scheme awareness</li>
                    <li>• Language barriers</li>
                    <li>• Digital illiteracy</li>
                    <li>• Complex applications</li>
                  </ul>
                </motion.div>

                {/* Node 2: Solution */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", delay: 0.5 }}
                  className="bg-slate-900/80 border border-slate-700 rounded-xl p-5 hover:border-emerald-500/50 hover:shadow-[0_10px_30px_rgba(16,185,129,0.15)] transition-all group"
                >
                  <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 group-hover:shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
                    The Solution
                  </h4>
                  <ul className="text-sm text-slate-400 space-y-2">
                    <li>• Voice-first Interaction</li>
                    <li>• AI Eligibility Engine</li>
                    <li>• Multilingual Guidance</li>
                    <li>• Service Centre Finder</li>
                  </ul>
                </motion.div>

                {/* Node 3: AI Engine */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", delay: 0.6 }}
                  className="bg-[#0d1730] border border-blue-900/40 rounded-xl p-5 hover:border-blue-500/40 hover:shadow-[0_4px_30px_rgba(37,99,235,0.15)] transition-all group"
                >
                  <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 group-hover:shadow-[0_0_8px_rgba(37,99,235,0.7)]"></span>
                    AI Processing
                  </h4>
                  <ul className="text-sm text-slate-400 space-y-2">
                    <li>• Speech-to-Text</li>
                    <li>• Profile Extraction</li>
                    <li>• Scheme Matching</li>
                    <li>• Generative AI Responses</li>
                  </ul>
                </motion.div>

                {/* Node 4: Scheme DB */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", delay: 0.7 }}
                  className="bg-slate-900/80 border border-slate-700 rounded-xl p-5 hover:border-yellow-500/50 hover:shadow-[0_10px_30px_rgba(234,179,8,0.15)] transition-all group"
                >
                  <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-500 group-hover:shadow-[0_0_10px_rgba(234,179,8,0.8)]"></span>
                    Scheme Database
                  </h4>
                  <ul className="text-sm text-slate-400 space-y-2">
                    <li>• Central & State Schemes</li>
                    <li>• Agriculture & Healthcare</li>
                    <li>• Education & Housing</li>
                    <li>• Details, FAQs, Deadlines</li>
                  </ul>
                </motion.div>

                {/* Node 5: Dashboard */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", delay: 0.8 }}
                  className="bg-slate-900/80 border border-slate-700 rounded-xl p-5 hover:border-purple-500/50 hover:shadow-[0_10px_30px_rgba(168,85,247,0.15)] transition-all group"
                >
                  <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500 group-hover:shadow-[0_0_10px_rgba(168,85,247,0.8)]"></span>
                    User Dashboard
                  </h4>
                  <ul className="text-sm text-slate-400 space-y-2">
                    <li>• Voice Search Interface</li>
                    <li>• My Eligibility Score</li>
                    <li>• Document Checklist</li>
                    <li>• Nearby Assistance</li>
                  </ul>
                </motion.div>

                {/* Node 6: Technology */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", delay: 0.9 }}
                  className="bg-slate-900/80 border border-slate-700 rounded-xl p-5 hover:border-pink-500/50 hover:shadow-[0_10px_30px_rgba(236,72,153,0.15)] transition-all group"
                >
                  <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-pink-500 group-hover:shadow-[0_0_10px_rgba(236,72,153,0.8)]"></span>
                    Technology Stack
                  </h4>
                  <ul className="text-sm text-slate-400 space-y-2">
                    <li>• Next.js & Tailwind CSS</li>
                    <li>• Node.js & Supabase</li>
                    <li>• Google Gemini AI</li>
                    <li>• Web Speech API</li>
                  </ul>
                </motion.div>
              </div>

              {/* Downward connecting line */}
              <motion.div 
                initial={{ height: 0 }}
                whileInView={{ height: 48 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 1.2 }}
                className="w-px bg-gradient-to-b from-blue-900/30 to-blue-600/40 mt-6"
              ></motion.div>

              {/* Final Output */}
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                viewport={{ once: true }}
                transition={{ type: "spring", delay: 1.5 }}
                className="bg-[#0d1730] border-2 border-blue-700/40 rounded-xl p-6 text-center w-full max-w-2xl relative z-20 shadow-[0_4px_20px_rgba(37,99,235,0.15)]"
              >
                <h3 className="text-xl font-bold text-white mb-3">Final Output</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  <span className="bg-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-full font-medium hover:bg-blue-900 hover:text-white transition-colors cursor-default">Eligible Schemes</span>
                  <span className="bg-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-full font-medium hover:bg-blue-900 hover:text-white transition-colors cursor-default">Required Documents</span>
                  <span className="bg-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-full font-medium hover:bg-blue-900 hover:text-white transition-colors cursor-default">Application Steps</span>
                  <span className="bg-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-full font-medium hover:bg-blue-900 hover:text-white transition-colors cursor-default">Voice Explanations</span>
                  <span className="bg-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-full font-medium hover:bg-blue-900 hover:text-white transition-colors cursor-default">Regional Languages</span>
                </div>
              </motion.div>

              {/* Downward connecting line */}
              <motion.div 
                initial={{ height: 0 }}
                whileInView={{ height: 48 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 1.8 }}
                className="w-px bg-gradient-to-b from-blue-500/50 to-emerald-500/50"
              ></motion.div>
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 2.1 }}
                className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-emerald-500/50 -mt-1"
              ></motion.div>

              {/* Social Impact */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                viewport={{ once: true }}
                transition={{ type: "spring", delay: 2.2 }}
                className="bg-emerald-950/30 border-2 border-emerald-500/50 rounded-full px-8 py-4 text-center mt-4 shadow-[0_0_30px_rgba(16,185,129,0.25)] cursor-default"
              >
                <h3 className="text-xl font-bold text-emerald-400 flex items-center justify-center gap-2">
                  <Globe className="w-5 h-5" />
                  Positive Social Impact
                </h3>
              </motion.div>

            </div>
          </div>
        </section>

        {/* How it works (Moved below Mind Map) */}
        <section id="how-it-works" className="py-24 relative overflow-hidden">
          <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-blue-800/10 rounded-full blur-[150px] -z-10 pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl mb-6">{t.hiwTitle}</h2>
                <p className="text-xl text-zinc-400 mb-12 font-light">{t.hiwDesc}</p>
                
                <div className="space-y-10">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex gap-6 group"
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-950/60 text-blue-300 flex items-center justify-center font-bold text-xl ring-1 ring-blue-900/50 group-hover:ring-blue-500/50 group-hover:bg-blue-600/10 transition-all">1</div>
                    <div>
                      <h4 className="text-2xl font-bold text-white mb-2">{t.step1Title}</h4>
                      <p className="text-zinc-400 leading-relaxed text-lg">{t.step1Desc}</p>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="flex gap-6 group"
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-950/60 text-indigo-300 flex items-center justify-center font-bold text-xl ring-1 ring-blue-900/50 group-hover:ring-indigo-500/50 group-hover:bg-indigo-600/10 transition-all">2</div>
                    <div>
                      <h4 className="text-2xl font-bold text-white mb-2">{t.step2Title}</h4>
                      <p className="text-zinc-400 leading-relaxed text-lg">{t.step2Desc}</p>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="flex gap-6 group"
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-950/60 text-blue-200 flex items-center justify-center font-bold text-xl ring-1 ring-blue-900/50 group-hover:ring-blue-400/50 group-hover:bg-blue-500/10 transition-all">3</div>
                    <div>
                      <h4 className="text-2xl font-bold text-white mb-2">{t.step3Title}</h4>
                      <p className="text-zinc-400 leading-relaxed text-lg">{t.step3Desc}</p>
                    </div>
                  </motion.div>
                </div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="mt-12"
                >
                  <Link 
                    href={`/demo?lang=${selectedLang}`}
                    className="inline-flex items-center gap-2 text-blue-300 font-bold text-lg hover:text-blue-200 transition-colors group"
                  >
                    {t.tryYourself} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                className="bg-[#0d1730] rounded-3xl shadow-2xl shadow-blue-950/50 border border-blue-900/30 p-8 lg:p-10 backdrop-blur-sm"
              >
                <h3 className="text-xl font-bold text-white border-b border-blue-900/30 pb-6 mb-8 flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-blue-400" />
                  System Architecture Overview
                </h3>
                <div className="space-y-4">
                  <div className="bg-blue-950/30 p-5 rounded-2xl border border-blue-900/30 flex justify-between items-center group hover:border-blue-600/40 transition-colors">
                    <span className="font-semibold text-slate-300">Frontend Interface</span>
                    <span className="text-xs bg-blue-900/30 text-blue-300 px-3 py-1.5 rounded-lg font-bold group-hover:bg-blue-600/20 group-hover:text-blue-200 transition-colors">Next.js + Tailwind</span>
                  </div>
                  <div className="bg-blue-950/30 p-5 rounded-2xl border border-blue-900/30 flex justify-between items-center group hover:border-indigo-600/40 transition-colors">
                    <span className="font-semibold text-slate-300">Voice Recognition</span>
                    <span className="text-xs bg-blue-900/30 text-blue-300 px-3 py-1.5 rounded-lg font-bold group-hover:bg-indigo-600/20 group-hover:text-indigo-200 transition-colors">Web Speech API</span>
                  </div>
                  <div className="bg-blue-950/30 p-5 rounded-2xl border border-blue-900/30 flex justify-between items-center group hover:border-blue-500/40 transition-colors">
                    <span className="font-semibold text-slate-300">Intelligence Engine</span>
                    <span className="text-xs bg-blue-900/30 text-blue-300 px-3 py-1.5 rounded-lg font-bold group-hover:bg-blue-600/20 group-hover:text-blue-200 transition-colors">Google Gemini</span>
                  </div>
                  <div className="bg-blue-950/30 p-5 rounded-2xl border border-blue-900/30 flex justify-between items-center group hover:border-blue-400/40 transition-colors">
                    <span className="font-semibold text-slate-300">Scheme Database</span>
                    <span className="text-xs bg-blue-900/30 text-blue-300 px-3 py-1.5 rounded-lg font-bold group-hover:bg-blue-500/20 group-hover:text-blue-100 transition-colors">JSON DB</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-[#060c18] py-12 border-t border-blue-900/20 relative">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-900/40 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-blue-500 to-blue-800 p-1.5 rounded-lg">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">JanSahayak<span className="text-blue-400">.AI</span></span>
            </div>
            <p className="text-zinc-600 text-sm font-medium">
              &copy; 2026 Build for Good Hackathon Project. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
