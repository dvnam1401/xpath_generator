import { AISettings } from '../types';

const SETTINGS_KEY = 'xpath_gen_ai_settings';

export const getSettings = (): AISettings => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to load settings", e);
  }
  return { apiKey: '', model: 'gemini-2.5-flash' };
};

export const saveSettings = (settings: AISettings) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error("Failed to save settings", e);
  }
};

export const hasApiKey = (): boolean => {
  const settings = getSettings();
  return !!settings.apiKey || !!process.env.API_KEY;
};