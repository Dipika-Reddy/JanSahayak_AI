"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Mic, Globe, Search, ArrowRight, ShieldCheck, Banknote, MapPin, Users, Check } from "lucide-react";
import { SUPPORTED_LANGUAGES, TRANSLATIONS } from "@/lib/translations";
import { motion, useScroll, useTransform } from "framer-motion";

export default function LandingPage() {
  const [selectedLang, setSelectedLang] = useState('en-IN');
  const t = TRANSLATIONS[selectedLang] || TRANSLATIONS['en-IN'];
  
  // Parallax effect for hero background
  const { scrollY } = useScroll();
  const yBg = useTransform(scrollY, [0, 1000], [0, 300]);

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 font-sans selection:bg-cyan-500/30 overflow-hidden">
      
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="sticky top-0 z-50 w-full border-b border-slate-800/50 bg-[#0B1120]/80 backdrop-blur-xl"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-cyan-400 to-indigo-500 p-1.5 rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.4)]">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">JanSahayak<span className="text-cyan-400">.AI</span></span>
            </div>
            
            <div className="hidden md:flex items-center space-x-2 text-sm font-medium text-zinc-400">
              {SUPPORTED_LANGUAGES.slice(0, 4).map(lang => (
                <button 
                  key={lang.code}
                  onClick={() => setSelectedLang(lang.code)}
                  className={`px-3 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${selectedLang === lang.code ? 'bg-cyan-500/10 text-cyan-400 font-semibold ring-1 ring-cyan-500/50' : 'hover:bg-zinc-800 hover:text-zinc-200'}`}
                >
                  {selectedLang === lang.code && <Check className="w-3 h-3" />}
                  {lang.label}
                </button>
              ))}
            </div>

            <div className="flex items-center">
              <Link 
                href={`/demo?lang=${selectedLang}`}
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-500 transition-all hover:scale-105 active:scale-95"
              >
                {t.tryLiveDemo}
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-10 pb-16 overflow-hidden">
          {/* Animated Background Mesh */}
          <motion.div 
            style={{ y: yBg }}
            className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-10" 
          />
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[120px] -z-10 mix-blend-screen pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[150px] -z-10 mix-blend-screen pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              
              {/* Hero Text */}
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="max-w-2xl"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-semibold mb-6 shadow-[0_0_15px_rgba(34,211,238,0.15)]">
                  <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
                  {t.heroTag}
                </div>
                <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
                  {t.heroTitlePart1} <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500 drop-shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                    {t.heroTitlePart2}
                  </span>
                </h1>
                <p className="text-xl text-zinc-400 mb-10 leading-relaxed font-light">
                  {t.heroDesc}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-5">
                  <Link 
                    href={`/demo?lang=${selectedLang}`}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 text-base font-bold text-white shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] hover:scale-105 active:scale-95 transition-all"
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
                <div className="relative rounded-2xl bg-zinc-900 shadow-2xl shadow-cyan-900/20 ring-1 ring-zinc-800 p-2 overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-fuchsia-500/10 opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
                  
                  {/* Mock Dashboard UI */}
                  <div className="relative bg-zinc-950 rounded-xl border border-zinc-800/80 shadow-inner overflow-hidden flex flex-col h-[520px]">
                    <div className="border-b border-zinc-800/80 p-4 bg-zinc-900/50 flex justify-between items-center backdrop-blur-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center ring-1 ring-cyan-500/50">
                          <Mic className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-zinc-100">{t.vaActive}</p>
                          <p className="text-xs text-cyan-400/80">{t.listeningIn}</p>
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                        <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse delay-75"></div>
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse delay-150"></div>
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
                         <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                           <Globe className="w-4 h-4 text-white" />
                         </div>
                         <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 text-cyan-50 rounded-2xl rounded-tr-none px-4 py-3 text-sm max-w-[80%] shadow-md border border-cyan-500/30 backdrop-blur-md">
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
                            <span className="inline-flex items-center rounded-md bg-cyan-500/10 px-2 py-1 text-xs font-semibold text-cyan-400 ring-1 ring-inset ring-cyan-500/20">Agriculture</span>
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
        <section className="py-24 bg-[#0F172A] border-y border-slate-800/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B1120] via-transparent to-[#0B1120] z-10 pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm font-semibold mb-4">
                <MapPin className="w-4 h-4" />
                Targeting Ground Zero
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl mb-6">{t.mapTitle || 'Identifying Needs Across India'}</h2>
              <p className="text-xl text-slate-400 font-light">{t.mapDesc || 'Targeting regions with low digital literacy and high dependency on agricultural welfare.'}</p>
            </motion.div>

            <div className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden bg-slate-900/40 border border-slate-800/80 shadow-[0_0_50px_rgba(34,211,238,0.1)] p-8">
              <div className="relative aspect-[4/3] w-full max-w-2xl mx-auto">
                {/* Background Map Image */}
                <img src="/india-map-neon.png" alt="India Map Outline" className="w-full h-full object-contain opacity-80 mix-blend-screen" />
                
                {/* Interactive Pins */}
                {/* UP/Bihar Region */}
                <div className="absolute top-[42%] left-[56%] group">
                  <div className="relative flex items-center justify-center cursor-pointer">
                    <div className="w-4 h-4 bg-fuchsia-500 rounded-full animate-ping absolute"></div>
                    <div className="w-3 h-3 bg-fuchsia-400 rounded-full relative z-10 shadow-[0_0_10px_rgba(217,70,239,0.8)]"></div>
                  </div>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-48 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-slate-950 border border-fuchsia-500/30 rounded-xl p-3 shadow-[0_0_20px_rgba(217,70,239,0.2)] z-30">
                    <p className="text-white font-bold text-sm mb-1">Uttar Pradesh & Bihar</p>
                    <p className="text-xs text-slate-400">Literacy: 67%</p>
                    <p className="text-xs text-fuchsia-400 mt-1">High Need: PM Kisan, Ration Cards</p>
                  </div>
                </div>

                {/* Central India */}
                <div className="absolute top-[50%] left-[45%] group">
                  <div className="relative flex items-center justify-center cursor-pointer">
                    <div className="w-4 h-4 bg-cyan-500 rounded-full animate-ping absolute delay-150"></div>
                    <div className="w-3 h-3 bg-cyan-400 rounded-full relative z-10 shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>
                  </div>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-48 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-slate-950 border border-cyan-500/30 rounded-xl p-3 shadow-[0_0_20px_rgba(34,211,238,0.2)] z-30">
                    <p className="text-white font-bold text-sm mb-1">Madhya Pradesh</p>
                    <p className="text-xs text-slate-400">Literacy: 69%</p>
                    <p className="text-xs text-cyan-400 mt-1">High Need: Crop Insurance</p>
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
        <section className="py-24 bg-zinc-900/50 border-y border-zinc-800 relative">
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
                className="bg-zinc-950 rounded-3xl p-8 border border-zinc-800/80 text-center hover:border-cyan-500/30 transition-colors group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="mx-auto w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center mb-8 ring-1 ring-zinc-800 group-hover:ring-cyan-500/50 group-hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all">
                    <Globe className="w-7 h-7 text-cyan-400" />
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
                className="bg-zinc-950 rounded-3xl p-8 border border-zinc-800/80 text-center hover:border-fuchsia-500/30 transition-colors group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-fuchsia-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="mx-auto w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center mb-8 ring-1 ring-zinc-800 group-hover:ring-fuchsia-500/50 group-hover:shadow-[0_0_20px_rgba(217,70,239,0.2)] transition-all">
                    <Search className="w-7 h-7 text-fuchsia-400" />
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
                className="bg-zinc-950 rounded-3xl p-8 border border-zinc-800/80 text-center hover:border-blue-500/30 transition-colors group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="mx-auto w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center mb-8 ring-1 ring-zinc-800 group-hover:ring-blue-500/50 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all">
                    <Users className="w-7 h-7 text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{t.digLit}</h3>
                  <p className="text-zinc-400 leading-relaxed">{t.digLitDesc}</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Project Mind Map Section (Moved Above How It Works) */}
        <section className="py-24 bg-[#0B1120] border-t border-slate-800/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/10 via-[#0B1120] to-[#0B1120] pointer-events-none" />
          
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
                className="bg-slate-900 border-2 border-cyan-500/50 rounded-2xl p-6 text-center shadow-[0_0_30px_rgba(34,211,238,0.2)] z-20 relative cursor-default"
              >
                <div className="mx-auto w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center mb-3">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">JanSahayak AI</h3>
                <p className="text-sm text-cyan-400 mt-1 font-semibold">AI-powered Multilingual Welfare Platform</p>
              </motion.div>

              {/* Vertical connecting line */}
              <motion.div 
                initial={{ height: 0 }}
                whileInView={{ height: 48 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-px bg-gradient-to-b from-cyan-500/50 to-slate-700"
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
                  className="bg-slate-900/80 border border-slate-700 rounded-xl p-5 hover:border-cyan-500/50 hover:shadow-[0_10px_30px_rgba(34,211,238,0.15)] transition-all group"
                >
                  <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-500 group-hover:shadow-[0_0_10px_rgba(34,211,238,0.8)]"></span>
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
                className="w-px bg-gradient-to-b from-slate-700 to-blue-500/50 mt-6"
              ></motion.div>

              {/* Final Output */}
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                viewport={{ once: true }}
                transition={{ type: "spring", delay: 1.5 }}
                className="bg-slate-900 border-2 border-blue-500/30 rounded-xl p-6 text-center w-full max-w-2xl relative z-20 shadow-[0_0_20px_rgba(59,130,246,0.15)]"
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
          <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-fuchsia-500/10 rounded-full blur-[150px] -z-10 mix-blend-screen pointer-events-none" />
          
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
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-zinc-900 text-cyan-400 flex items-center justify-center font-bold text-xl ring-1 ring-zinc-800 group-hover:ring-cyan-500/50 group-hover:bg-cyan-500/10 transition-all">1</div>
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
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-zinc-900 text-fuchsia-400 flex items-center justify-center font-bold text-xl ring-1 ring-zinc-800 group-hover:ring-fuchsia-500/50 group-hover:bg-fuchsia-500/10 transition-all">2</div>
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
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-zinc-900 text-blue-400 flex items-center justify-center font-bold text-xl ring-1 ring-zinc-800 group-hover:ring-blue-500/50 group-hover:bg-blue-500/10 transition-all">3</div>
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
                    className="inline-flex items-center gap-2 text-cyan-400 font-bold text-lg hover:text-cyan-300 transition-colors group"
                  >
                    {t.tryYourself} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                className="bg-zinc-900/50 rounded-3xl shadow-2xl shadow-black/50 border border-zinc-800 p-8 lg:p-10 backdrop-blur-sm"
              >
                <h3 className="text-xl font-bold text-white border-b border-zinc-800 pb-6 mb-8 flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-cyan-400" />
                  System Architecture Overview
                </h3>
                <div className="space-y-4">
                  <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800/80 flex justify-between items-center group hover:border-cyan-500/30 transition-colors">
                    <span className="font-semibold text-zinc-300">Frontend Interface</span>
                    <span className="text-xs bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-lg font-bold group-hover:bg-cyan-500/10 group-hover:text-cyan-400 transition-colors">Next.js + Tailwind</span>
                  </div>
                  <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800/80 flex justify-between items-center group hover:border-fuchsia-500/30 transition-colors">
                    <span className="font-semibold text-zinc-300">Voice Recognition</span>
                    <span className="text-xs bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-lg font-bold group-hover:bg-fuchsia-500/10 group-hover:text-fuchsia-400 transition-colors">Web Speech API</span>
                  </div>
                  <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800/80 flex justify-between items-center group hover:border-emerald-500/30 transition-colors">
                    <span className="font-semibold text-zinc-300">Intelligence Engine</span>
                    <span className="text-xs bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-lg font-bold group-hover:bg-emerald-500/10 group-hover:text-emerald-400 transition-colors">Google Gemini</span>
                  </div>
                  <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800/80 flex justify-between items-center group hover:border-blue-500/30 transition-colors">
                    <span className="font-semibold text-zinc-300">Scheme Database</span>
                    <span className="text-xs bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-lg font-bold group-hover:bg-blue-500/10 group-hover:text-blue-400 transition-colors">JSON DB</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-zinc-950 py-12 border-t border-zinc-900 relative">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-cyan-400 to-indigo-500 p-1.5 rounded-lg">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">JanSahayak<span className="text-cyan-400">.AI</span></span>
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
