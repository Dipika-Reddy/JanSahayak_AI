import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, FileText, MapPin, Square, Volume2 } from 'lucide-react';

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
  return (
    <Card
      id={`scheme-${scheme.id || originalIndex}`}
      className={`overflow-hidden border-zinc-200 dark:border-zinc-800 transition-all ${
        speakingScheme === scheme.id ? 'ring-2 ring-blue-500 shadow-md' : ''
      }`}
    >
      <CardHeader className="bg-zinc-50 dark:bg-zinc-900/50 pb-4">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl text-blue-700 dark:text-blue-400">
              {scheme.name}
            </CardTitle>
            <CardDescription className="mt-1 text-sm whitespace-pre-line">
              {cleanHtmlText(scheme.description)}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge
              className={
                scheme.matchDetails.eligibility === 'Eligible' ||
                scheme.matchDetails.eligibility === 'पात्र' ||
                scheme.matchDetails.eligibility === 'அர்ஹులు'
                  ? 'bg-green-100 text-green-800 hover:bg-green-100'
                  : scheme.matchDetails.eligibility === 'Not Eligible' ||
                    scheme.matchDetails.eligibility === 'अपात्र'
                  ? 'bg-red-100 text-red-800 hover:bg-red-100'
                  : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
              }
            >
              {scheme.matchDetails.eligibility}
            </Badge>
            <Button
              size="icon"
              variant="ghost"
              title="Read scheme aloud"
              className={`rounded-full w-11 h-11 shrink-0 transition-all shadow-md ${
                speakingScheme === scheme.id
                  ? 'bg-gradient-to-br from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 shadow-red-300 animate-pulse'
                  : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-blue-300 hover:shadow-blue-400 hover:scale-110'
              }`}
              onClick={() => playTTS(scheme, originalIndex)}
            >
              {speakingScheme === scheme.id && isPlaying ? (
                <Square className="w-5 h-5 fill-current" />
              ) : (
                <Volume2 className="w-6 h-6 stroke-[2.5]" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div className="flex gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">
              <T lang={langQuery}>Why you qualify</T>
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {scheme.matchDetails.reason}
            </p>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <p className="font-medium text-blue-900 dark:text-blue-200">
            <T lang={langQuery}>Benefits</T>
          </p>
          <p className="text-sm text-blue-800 dark:text-blue-300 whitespace-pre-line">
            {cleanHtmlText(scheme.benefits)}
          </p>
        </div>

        <div>
          <p className="font-medium flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-zinc-500" />
            <T lang={langQuery}>Required Documents</T>
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {scheme.required_documents?.map((doc: string, idx: number) => (
              <li
                key={idx}
                className="text-sm flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 rounded border border-zinc-100 dark:border-zinc-800"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <T lang={langQuery}>{doc}</T>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="bg-zinc-50 dark:bg-zinc-900/50 flex flex-col gap-3 pt-4">
        <div className="w-full flex flex-col sm:flex-row gap-3">
          {scheme.application_link ? (
            <a
              href={getTranslatedLink(scheme.application_link)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white shadow-sm font-semibold gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                <T lang={langQuery}>Apply Online</T>
              </Button>
            </a>
          ) : (
            <a
              href={`https://www.google.com/search?q=${encodeURIComponent(
                scheme.name + ' official government portal apply online India'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button
                variant="outline"
                className="w-full border-blue-300 text-blue-700 hover:bg-blue-50 font-semibold gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                Search Official Portal
              </Button>
            </a>
          )}
          <Button
            variant="outline"
            className="w-full sm:w-auto gap-2"
            onClick={() =>
              window.open('https://www.google.com/maps/search/MeeSeva+or+CSC+center+near+me', '_blank')
            }
          >
            <MapPin className="w-4 h-4" />
            <T lang={langQuery}>Find Nearby Center</T>
          </Button>
        </div>

        {scheme.offline_process && (
          <div className="w-full p-3 rounded-lg bg-orange-50 border border-orange-200 text-sm text-orange-800 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-200">
            <strong>
              <T lang={langQuery}>Offline Application:</T>
            </strong>{' '}
            {scheme.offline_process}
            {scheme.nearest_office && (
              <div className="mt-1">
                <strong>
                  <T lang={langQuery}>Nearest Office:</T>
                </strong>{' '}
                {scheme.nearest_office}
              </div>
            )}
          </div>
        )}

        {!scheme.application_link && !scheme.offline_process && (
          <div className="w-full p-3 rounded-lg bg-zinc-100 border border-zinc-200 text-sm text-zinc-600 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400">
            ℹ️ Visit your nearest <strong>Common Service Centre (CSC)</strong> or{' '}
            <strong>District Collectorate</strong> for application assistance.
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
