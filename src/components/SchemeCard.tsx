"use client";

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  FileText,
  MapPin,
  Square,
  Volume2,
  ChevronRight,
  ExternalLink,
  Search,
  Building2,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { TRANSLATIONS } from '@/lib/translations';

export const sanitizeText = (text: string): string => {
  if (!text) return "";
  return text
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/?[^>]+(>|$)/g, "")
    .replace(/&nbsp;/gi, ' ')
    .replace(/~{3,}/g, '')
    .replace(/:{3,}/g, '')
    .replace(/⟦SEP⟧/g, '')
    .replace(/\|{2,}/g, '')
    .replace(/\*{2,}/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

export interface BenefitBullet {
  icon: string;
  text: string;
}

export function parseBulletBenefits(rawBenefits: string): BenefitBullet[] {
  const clean = sanitizeText(rawBenefits);
  if (!clean) return [];

  // Split text by period, colon, bullets, or numbers
  let parts = clean
    .split(/(?:>|-|•|\d+\.|\:\s+|\.\s+)/)
    .map(s => s.trim())
    .filter(s => s.length > 6);

  if (parts.length < 3) {
    parts = clean
      .split(/(?:;|\.\s+)/)
      .map(s => s.trim())
      .filter(s => s.length > 6);
  }

  // Limit to 4 to 6 concise bullet points
  const points = parts.slice(0, 6);

  return points.map(p => {
    const lower = p.toLowerCase();
    let icon = "✅";

    if (/₹|rs\.?|rupees?|amount|financial|grant|stipend|subsidy|lakh|cash|fee|per annum|per year|cost/.test(lower)) {
      icon = "💰";
    } else if (/diploma|degree|pg|phd|scholarship|student|course|education|school|college|university|study|training/.test(lower)) {
      icon = "🎓";
    } else if (/state|district|region|all india|national|telangana|andhra|karnataka|kerala|rural/.test(lower)) {
      icon = "📍";
    } else if (/renewal|continue|continuing|every year|annual|period/.test(lower)) {
      icon = "🔄";
    } else if (/health|hospital|medical|insurance|treatment|care|life/.test(lower)) {
      icon = "🏥";
    }

    return { icon, text: p };
  });
}

// Renders benefit text with key amounts/percentages highlighted
export const renderHighlightedText = (text: string) => {
  const regex = /(₹\s*[\d,]+(?:\/-)?|rs\.?\s*[\d,]+|\d+%\s*|\d+(?:\.\d+)?\s*(?:lakhs?|lakh|k)|(?:\d+-\d+|\d+)\s*(?:years|yrs|per annum|per year))/gi;
  const parts = text.split(regex);
  const matches = text.match(regex);

  if (!matches) return <span>{text}</span>;

  return (
    <span>
      {parts.map((part, i) => (
        <React.Fragment key={i}>
          {part}
          {matches[i] && (
            <mark className="bg-amber-100 text-amber-950 font-bold px-1.5 py-0.5 rounded border border-amber-200/80 notranslate" translate="no">
              {matches[i]}
            </mark>
          )}
        </React.Fragment>
      ))}
    </span>
  );
};

interface CompactSchemeCardProps {
  scheme: any;
  originalIndex: number;
  isSelected: boolean;
  isSpeaking: boolean;
  onSelect: () => void;
  langQuery: string;
  T: React.ComponentType<{ children: string; lang: string }>;
}

export function CompactSchemeCard({
  scheme,
  originalIndex,
  isSelected,
  isSpeaking,
  onSelect,
  langQuery,
  T,
}: CompactSchemeCardProps) {
  const tStatic = TRANSLATIONS[langQuery] || TRANSLATIONS['en-IN'];
  const nameText = sanitizeText(scheme.name);
  const descriptionText = sanitizeText(scheme.description);

  return (
    <div
      onClick={onSelect}
      className={`
        relative rounded-xl p-3.5 border transition-all duration-200 cursor-pointer select-none
        ${isSelected
          ? 'bg-blue-50/90 border-blue-500 shadow-md ring-2 ring-blue-500/30'
          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm'
        }
      `}
    >
      {isSpeaking && (
        <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500" />
        </span>
      )}

      <div className="flex items-start gap-3">
        <div className={`
          shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mt-0.5
          ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}
        `}>
          {originalIndex + 1}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-bold leading-snug line-clamp-2 ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
            {nameText}
          </h4>

          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            {scheme.central_or_state && (
              <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                {scheme.central_or_state}
              </span>
            )}
            {scheme.category && (
              <span className="text-[10px] font-semibold text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded-md truncate max-w-[120px]">
                {scheme.category}
              </span>
            )}
          </div>

          <p className="text-xs text-slate-500 line-clamp-1 mt-1 leading-normal">
            {descriptionText}
          </p>
        </div>

        <ChevronRight className={`w-4 h-4 shrink-0 self-center transition-transform ${isSelected ? 'text-blue-600 translate-x-0.5' : 'text-slate-300'}`} />
      </div>
    </div>
  );
}

interface SchemeCardProps {
  scheme: any;
  originalIndex: number;
  speakingScheme: string | null;
  isPlaying: boolean;
  playTTS: (scheme: any, index: number) => void;
  getTranslatedLink: (url: string) => string;
  cleanHtmlText: (text: string) => string;
  langQuery: string;
  T: React.ComponentType<{ children: string; lang: string }>;
}

export function SchemeCard({
  scheme,
  originalIndex,
  speakingScheme,
  isPlaying,
  playTTS,
  getTranslatedLink,
  cleanHtmlText,
  langQuery,
  T,
}: SchemeCardProps) {
  const [showFullBenefits, setShowFullBenefits] = useState(false);
  const isSpeaking = speakingScheme === scheme.id;
  const tStatic = TRANSLATIONS[langQuery] || TRANSLATIONS['en-IN'];
  const isEnglish = langQuery === 'en-IN';

  const isEligible =
    scheme.matchDetails?.eligibility === 'Eligible' ||
    scheme.matchDetails?.eligibility === 'पात्र' ||
    scheme.matchDetails?.eligibility === 'అర్హులు' ||
    scheme.matchDetails?.eligibility === 'తగుதியானవర్';

  const badgeClass = isEligible
    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
    : 'bg-amber-100 text-amber-800 border border-amber-200';

  const nameText = sanitizeText(scheme.name);
  const benefitsText = sanitizeText(scheme.benefits);
  const descriptionText = sanitizeText(scheme.description);
  const reasonText = sanitizeText(scheme.matchDetails?.reason);

  const bulletBenefits = parseBulletBenefits(benefitsText);

  return (
    <div
      id={`scheme-${scheme.id || originalIndex}`}
      className="relative rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden notranslate"
      translate="no"
    >
      {/* Detail Header */}
      <div className={`p-6 border-b border-slate-100 ${isSpeaking ? 'bg-blue-50/70' : 'bg-slate-50/50'}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                #{originalIndex + 1}
              </span>
              {scheme.central_or_state && (
                <span className="text-xs font-semibold text-slate-600 bg-slate-200/80 px-2.5 py-0.5 rounded-full">
                  {scheme.central_or_state} {tStatic.schemeSuffix || 'Scheme'}
                </span>
              )}
              {scheme.category && (
                <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
                  {scheme.category}
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
              {nameText}
            </h2>

            {!isEnglish && scheme.name_en && scheme.name_en !== nameText && (
              <p className="text-xs text-slate-500 font-normal italic">
                ({sanitizeText(scheme.name_en)})
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${badgeClass}`}>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              {scheme.matchDetails?.eligibility || 'Eligible'}
            </span>

            <button
              title={tStatic.readAloud || 'Read scheme aloud'}
              aria-label={tStatic.readAloud || 'Read scheme aloud'}
              onClick={() => playTTS(scheme, originalIndex)}
              className={`
                w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-500
                ${isSpeaking
                  ? 'bg-red-500 text-white shadow-md shadow-red-200 scale-105'
                  : 'bg-blue-600 text-white shadow-md shadow-blue-200 hover:bg-blue-700 hover:scale-105'
                }
              `}
            >
              {isSpeaking && isPlaying ? (
                <Square className="w-5 h-5 fill-current" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Full Overview Description */}
        <p className="mt-4 text-sm text-slate-600 leading-relaxed">
          {descriptionText}
        </p>
      </div>

      {/* Card Content Body */}
      <div className="p-6 space-y-5">
        {/* Why You Qualify */}
        <div className="flex items-start gap-3 bg-emerald-50/80 border border-emerald-100 rounded-xl p-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-emerald-900 uppercase tracking-wide">
              <T lang={langQuery}>Why you qualify</T>
            </p>
            <p className="text-sm text-emerald-800 leading-relaxed font-medium">
              {reasonText}
            </p>
          </div>
        </div>

        {/* Simplified Accessible Benefits Section */}
        <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <T lang={langQuery}>Key Benefits</T>
            </p>

            <button
              onClick={() => setShowFullBenefits(!showFullBenefits)}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
            >
              {showFullBenefits ? (
                <><ChevronUp className="w-3.5 h-3.5" /> Summary View</>
              ) : (
                <><ChevronDown className="w-3.5 h-3.5" /> Full Text</>
              )}
            </button>
          </div>

          {!showFullBenefits ? (
            /* 4-6 Easy Icon Bullet Points */
            <div className="grid grid-cols-1 gap-2.5 pt-1">
              {bulletBenefits.length > 0 ? (
                bulletBenefits.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-white/90 border border-blue-100 rounded-xl p-3 shadow-2xs">
                    <span className="text-base shrink-0 select-none">{item.icon}</span>
                    <p className="text-sm text-slate-800 leading-snug font-medium flex-1">
                      {renderHighlightedText(item.text)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-blue-950 leading-relaxed font-normal">
                  {renderHighlightedText(benefitsText)}
                </p>
              )}
            </div>
          ) : (
            /* Full Untruncated Raw Text */
            <div className="pt-2 border-t border-blue-100 text-sm text-blue-950 leading-relaxed font-normal bg-white/80 p-4 rounded-xl">
              {renderHighlightedText(benefitsText)}
            </div>
          )}
        </div>

        {/* Required Documents Grid */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-slate-500" />
            <T lang={langQuery}>Required Documents</T>
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {scheme.required_documents?.map((doc: string, idx: number) => (
              <li
                key={idx}
                className="text-xs sm:text-sm flex items-center gap-2.5 bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-lg text-slate-700 font-medium"
              >
                <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                {sanitizeText(doc)}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer Action Buttons */}
      <div className="px-6 pb-6 pt-3 border-t border-slate-100 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {scheme.application_link ? (
            <a
              href={getTranslatedLink(scheme.application_link)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <button className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm py-3 px-4 rounded-xl transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <ExternalLink className="w-4 h-4" />
                <T lang={langQuery}>Apply Online</T>
              </button>
            </a>
          ) : (
            <a
              href={`https://www.google.com/search?q=${encodeURIComponent((scheme.name_en || nameText) + ' official government portal apply online India')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <button className="w-full flex items-center justify-center gap-2 border-2 border-blue-300 text-blue-700 hover:bg-blue-50 font-semibold text-sm py-3 px-4 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
                <Search className="w-4 h-4" />
                {tStatic.searchPortal || 'Search Official Portal'}
              </button>
            </a>
          )}

          <button
            onClick={() =>
              window.open('https://www.google.com/maps/search/MeeSeva+or+CSC+center+near+me', '_blank')
            }
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 border-2 border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-sm py-3 px-4 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            <MapPin className="w-4 h-4 text-rose-500" />
            <T lang={langQuery}>Find Nearby Center</T>
          </button>
        </div>

        {/* Offline Process */}
        {scheme.offline_process && (
          <div className="w-full p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 leading-relaxed">
            <p className="font-semibold mb-0.5">
              {tStatic.offlineApplication || 'Offline Application:'}
            </p>
            <p>{sanitizeText(scheme.offline_process)}</p>
            {scheme.nearest_office && (
              <p className="mt-1">
                <span className="font-semibold">
                  {tStatic.nearestOffice || 'Nearest Office:'}
                </span>{' '}
                {sanitizeText(scheme.nearest_office)}
              </p>
            )}
          </div>
        )}

        {!scheme.application_link && !scheme.offline_process && (
          <div className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
            <Building2 className="w-4 h-4 shrink-0 mt-0.5 text-slate-400" />
            <span>
              {tStatic.visitCSC || 'Visit your nearest Common Service Centre (CSC) or District Collectorate for application assistance.'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
