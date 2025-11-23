export enum PriorityLevel {
  ID = 1,
  TEXT = 2,
  ATTRIBUTE = 3,
  CLASS = 4,
  COMBINATION = 5,
  GENERIC = 6
}

export interface XPathResult {
  id: string;
  xpath: string;
  priority: PriorityLevel;
  description: string;
  category: 'ID' | 'Text' | 'Attribute' | 'Class' | 'Combo';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface HistoryItem {
  id: string;
  htmlSnippet: string;
  results: XPathResult[];
  timestamp: number;
}