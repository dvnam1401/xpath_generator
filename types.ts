
export enum PriorityLevel {
  PLAYWRIGHT_ROLE = 0, // Playwright getByRole (Best)
  ROBUST_ID = 1,       // By.id (Safe)
  NAME = 2,            // By.name
  LABEL_FOR = 3,       // <label for="id">
  LINK_TEXT = 4,       // By.linkText
  PLAYWRIGHT_TEXT = 5, // getByText
  CSS_ID = 6,          // css=#id
  CSS_CLASS = 7,       // css=.class
  CSS_ATTR = 8,        // css=[attr=val]
  XPATH_TEXT = 9,      // xpath=//*[text()='...']
  XPATH_LABEL = 10,     // xpath=//label.../input (New Strategy)
  XPATH_CONTEXT = 11,   // xpath=//parent[@id]/descendant
  XPATH_COMPLEX = 12,   // xpath complex
  DYNAMIC_ID = 13      // By.id (Unsafe/Dynamic)
}

export type LocatorMethod = 'id' | 'name' | 'linkText' | 'partialLinkText' | 'css' | 'xpath' | 'role' | 'label' | 'placeholder' | 'text';

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
  elementName?: string; // Optional: Human readable name of the element (e.g., "Login Button")
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
