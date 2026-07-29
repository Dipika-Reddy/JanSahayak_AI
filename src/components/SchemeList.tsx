"use client";

import React, { useState, useEffect } from 'react';
import { SchemeCard, CompactSchemeCard } from './SchemeCard';
import { Pagination } from './Pagination';
import { CheckCircle2, ListFilter, Search, ArrowLeft } from 'lucide-react';
import { TRANSLATIONS } from '@/lib/translations';

interface SchemeListProps {
  results: any[];
  speakingScheme: string | null;
  isPlaying: boolean;
  playTTS: (scheme: any, index: number) => void;
  getTranslatedLink: (url: string) => string;
  cleanHtmlText: (text: string) => string;
  langQuery: string;
  T: React.ComponentType<{ children: string; lang: string }>;
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

export function SchemeList({
  results,
  speakingScheme,
  isPlaying,
  playTTS,
  getTranslatedLink,
  cleanHtmlText,
  langQuery,
  T,
  currentPage,
  setCurrentPage,
}: SchemeListProps) {
  const [selectedSchemeId, setSelectedSchemeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');

  // Initialize selected scheme on results change
  useEffect(() => {
    if (results && results.length > 0) {
      if (!selectedSchemeId || !results.some(s => s.id === selectedSchemeId)) {
        setSelectedSchemeId(results[0].id);
      }
    }
  }, [results]);

  // Sync selected scheme with active voice speaking scheme
  useEffect(() => {
    if (speakingScheme) {
      setSelectedSchemeId(speakingScheme);
      setMobileView('detail');
    }
  }, [speakingScheme]);

  if (!results || results.length === 0) {
    const tStatic = TRANSLATIONS[langQuery] || TRANSLATIONS['en-IN'];
    return (
      <div className="w-full flex flex-col items-center justify-center py-16 px-6 text-center bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <ListFilter className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">
          <T lang={langQuery}>No matching schemes found for this profile.</T>
        </h3>
        <p className="text-sm text-slate-500 max-w-sm">
          {tStatic.tryMoreDetails || 'Try providing more details like your age, income, occupation, or state to get better results.'}
        </p>
      </div>
    );
  }

  const itemsPerPage = 6;
  
  // Quick filter
  const filteredResults = searchQuery.trim()
    ? results.filter(s => 
        (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.central_or_state || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : results;

  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleResults = filteredResults.slice(startIndex, startIndex + itemsPerPage);

  // Selected scheme object and index
  const selectedIndex = results.findIndex(s => s.id === selectedSchemeId);
  const selectedScheme = selectedIndex !== -1 ? results[selectedIndex] : results[0];

  const handleSelectScheme = (scheme: any, idx: number) => {
    setSelectedSchemeId(scheme.id);
    setMobileView('detail');
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const topEl = document.getElementById('schemes-master-detail-top');
    if (topEl) topEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div id="schemes-master-detail-top" className="w-full space-y-4 mt-2">
      {/* Top Banner Bar */}
      <div className="flex items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl px-5 py-3.5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-800 leading-tight flex items-center gap-2">
              <T lang={langQuery}>Eligible Schemes</T>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-600 text-white">
                {results.length}
              </span>
            </h2>
            <p className="text-xs text-slate-500 hidden sm:block">
              {results.length} {(TRANSLATIONS[langQuery] || TRANSLATIONS['en-IN']).schemes || 'schemes'} {(TRANSLATIONS[langQuery] || TRANSLATIONS['en-IN']).foundForProfile || 'found for your profile'}
            </p>
          </div>
        </div>

        {/* Mobile View Switcher */}
        <div className="md:hidden flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setMobileView('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mobileView === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'
            }`}
          >
            List ({results.length})
          </button>
          <button
            onClick={() => setMobileView('detail')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mobileView === 'detail' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'
            }`}
          >
            Details
          </button>
        </div>
      </div>

      {/* Synchronized Equal Height Master-Detail Responsive Container */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch md:h-[calc(100vh-140px)]">
        {/* Left Sidebar (Master Scheme List) */}
        <div
          className={`
            md:col-span-5 lg:col-span-4 flex flex-col h-full space-y-3
            ${mobileView === 'detail' ? 'hidden md:flex' : 'flex'}
          `}
        >
          {/* Quick Search Input */}
          <div className="relative shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search schemes..."
              className="w-full text-xs py-2.5 pl-9 pr-3 rounded-xl border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Independent Scrollable Compact List (Fills remaining height) */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1.5 custom-scrollbar">
            {visibleResults.map((scheme, index) => {
              const originalIndex = startIndex + index;
              const isSelected = scheme.id === selectedScheme?.id;
              const isSpeaking = speakingScheme === scheme.id;

              return (
                <CompactSchemeCard
                  key={scheme.id || originalIndex}
                  scheme={scheme}
                  originalIndex={originalIndex}
                  isSelected={isSelected}
                  isSpeaking={isSpeaking}
                  onSelect={() => handleSelectScheme(scheme, originalIndex)}
                  langQuery={langQuery}
                  T={T}
                />
              );
            })}
          </div>

          {/* Sidebar Pagination (Fixed at bottom of left column) */}
          <div className="pt-2 shrink-0">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredResults.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              langQuery={langQuery}
              T={T}
            />
          </div>
        </div>

        {/* Right Main Panel (Selected Scheme Details - Independent Scrollable, Equal Height) */}
        <div
          className={`
            md:col-span-7 lg:col-span-8 flex flex-col h-full overflow-y-auto pr-1 custom-scrollbar
            ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}
          `}
        >
          {/* Mobile Back Button */}
          <div className="md:hidden mb-3 shrink-0">
            <button
              onClick={() => setMobileView('list')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-2 rounded-xl"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to scheme list
            </button>
          </div>

          {/* Full Scheme Detail View */}
          {selectedScheme && (
            <div className="flex-1">
              <SchemeCard
                scheme={selectedScheme}
                originalIndex={selectedIndex !== -1 ? selectedIndex : 0}
                speakingScheme={speakingScheme}
                isPlaying={isPlaying}
                playTTS={playTTS}
                getTranslatedLink={getTranslatedLink}
                cleanHtmlText={cleanHtmlText}
                langQuery={langQuery}
                T={T}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
