import { HistoryItem, ChatMessage } from '../types';

const STORAGE_KEY = 'xpath_gen_history';
const CHAT_STORAGE_KEY = 'xpath_gen_chat_history';
const LAST_ACTIVE_KEY = 'xpath_gen_last_active';
const TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

export const updateLastActive = () => {
  try {
    localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
  } catch (e) {
    console.warn('LocalStorage unavailable');
  }
};

export const checkExpiration = (): boolean => {
  try {
    const lastActiveStr = localStorage.getItem(LAST_ACTIVE_KEY);
    if (!lastActiveStr) return true; // No record = expired/empty

    const lastActive = parseInt(lastActiveStr, 10);
    const now = Date.now();
    
    // Check if difference exceeds 15 mins
    if (now - lastActive > TIMEOUT_MS) {
      clearHistory();
      return true;
    }
    return false;
  } catch (e) {
    return true;
  }
};

export const getHistory = (): HistoryItem[] => {
  if (checkExpiration()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

export const saveHistoryItem = (item: HistoryItem): HistoryItem[] => {
  // Check if session expired before adding; if so, we start fresh
  if (checkExpiration()) {
     // History was cleared by checkExpiration
  }
  
  const current = getHistory();
  
  // Prevent duplicate if user clicks generate multiple times on exact same content
  if (current.length > 0 && current[0].htmlSnippet === item.htmlSnippet) {
      updateLastActive();
      return current;
  }

  const updated = [item, ...current].slice(0, 30); // Keep last 30 items
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    updateLastActive();
  } catch (e) {
    console.error('Failed to save history', e);
  }
  return updated;
};

// --- Chat History Logic ---

export const getChatHistory = (): ChatMessage[] => {
  if (checkExpiration()) return [];
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

export const saveChatHistory = (messages: ChatMessage[]) => {
  try {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    updateLastActive();
  } catch (e) {
    console.error('Failed to save chat history', e);
  }
};

export const clearHistory = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CHAT_STORAGE_KEY);
    localStorage.removeItem(LAST_ACTIVE_KEY);
  } catch (e) {}
};