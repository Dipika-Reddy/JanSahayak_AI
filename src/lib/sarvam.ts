/**
 * lib/sarvam.ts
 *
 * Configuration and client constants/helpers for the Sarvam AI integration.
 */

export const SARVAM_API_KEY = process.env.SARVAM_API_KEY || '';
export const SARVAM_BASE_URL = process.env.SARVAM_BASE_URL || 'https://api.sarvam.ai';

export const isSarvamConfigured = (): boolean => {
  return !!SARVAM_API_KEY;
};

export const getSarvamHeaders = (): Record<string, string> => {
  return {
    'api-subscription-key': SARVAM_API_KEY,
    'Content-Type': 'application/json',
  };
};
