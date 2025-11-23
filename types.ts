
export enum PriorityLevel {
  ROBUST_ID = 1,       // By.id (Safe)
  NAME = 2,            // By.name
  LINK_TEXT = 3,       // By.linkText
  CSS_ID = 4,          // css=#id
  CSS_CLASS = 5,       // css=.class
  CSS_ATTR = 6,        // css=[attr=val]
  XPATH_TEXT = 7,      // xpath=//*[text()='...']
  XPATH_LABEL = 8,     // xpath=//label.../input (New Strategy)
  XPATH_COMPLEX = 9,   // xpath complex
  DYNAMIC_ID = 10      // By.id (Unsafe/Dynamic)
}

export type LocatorMethod = 'id' | 'name' | 'linkText' | 'partialLinkText' | 'css' | 'xpath';

export type TestTool = 
  | 'selenium' 
  | 'playwright' 
  | 'cypress' 
  | 'appium' 
  | 'katalon' 
  | 'robot';

export type ProgrammingLanguage = 
  | 'java' 
  | 'python' 
  | 'csharp' 
  | 'javascript' 
  | 'typescript' 
  | 'ruby' 
  | 'groovy' 
  | 'robot'; // Robot syntax is unique

export interface GeneratedLocator {
  id: string;
  method: LocatorMethod;
  value: string;         // The raw locator string (e.g., "submit-btn", "//div...")
  codeSnippet: string;   // Generated code for specific framework
  priority: PriorityLevel;
  description: string;
  stability: 'High' | 'Medium' | 'Low';
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
  results: GeneratedLocator[];
  timestamp: number;
}

export interface AISettings {
  apiKey: string;
  model: string;
}

export type Language = 'en' | 'vi';

export interface IChatSession {
  sendMessage(text: string): Promise<string>;
}
