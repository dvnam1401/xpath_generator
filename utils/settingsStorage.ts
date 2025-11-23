
import { AISettings, TestTool, ProgrammingLanguage } from '../types';

const SETTINGS_KEY = 'xpath_gen_ai_settings';
const TOOL_KEY = 'xpath_gen_tool';
const LANG_KEY = 'xpath_gen_language';
const PROG_LANG_KEY = 'xpath_gen_prog_language';

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
  return !!settings.apiKey;
};

export const getStoredTool = (): TestTool => {
  try {
    return (localStorage.getItem(TOOL_KEY) as TestTool) || 'selenium';
  } catch {
    return 'selenium';
  }
};

export const saveStoredTool = (tool: TestTool) => {
  localStorage.setItem(TOOL_KEY, tool);
};

// UI Language (En/Vi)
export const getStoredLanguage = (): string => {
   // Legacy reasons, this file handled settings, translations.ts handled UI lang. 
   // This export might not be used here but keeping for safety if referenced.
   return 'en';
}

// Programming Language (Java, Python...)
export const getStoredProgLang = (): ProgrammingLanguage => {
  try {
    return (localStorage.getItem(PROG_LANG_KEY) as ProgrammingLanguage) || 'java';
  } catch {
    return 'java';
  }
};

export const saveStoredProgLang = (lang: ProgrammingLanguage) => {
  localStorage.setItem(PROG_LANG_KEY, lang);
};
