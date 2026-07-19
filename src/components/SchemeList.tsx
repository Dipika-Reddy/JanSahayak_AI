import React from 'react';
import { SchemeCard } from './SchemeCard';
import { Pagination } from './Pagination';

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
  if (!results || results.length === 0) {
    return (
      <p className="text-zinc-500 text-center py-8">
        <T lang={langQuery}>No matching schemes found for this profile.</T>
      </p>
    );
  }

  const itemsPerPage = 10;
  const totalPages = Math.ceil(results.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleResults = results.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Smooth scroll to the schemes list start block
    const listElement = document.getElementById('impact-map');
    if (listElement) {
      listElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full space-y-6 mt-4 animate-fade-in">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-zinc-100">
          <T lang={langQuery}>Eligible Schemes</T>
        </h2>
      </div>

      <div className="space-y-6">
        {visibleResults.map((scheme, index) => {
          const originalIndex = startIndex + index;
          return (
            <SchemeCard
              key={scheme.id || originalIndex}
              scheme={scheme}
              originalIndex={originalIndex}
              speakingScheme={speakingScheme}
              isPlaying={isPlaying}
              playTTS={playTTS}
              getTranslatedLink={getTranslatedLink}
              cleanHtmlText={cleanHtmlText}
              langQuery={langQuery}
              T={T}
            />
          );
        })}
      </div>

      {/* Pagination Controls */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={results.length}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        langQuery={langQuery}
        T={T}
      />
    </div>
  );
}
