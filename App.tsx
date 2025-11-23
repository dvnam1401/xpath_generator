
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { XPathResultCard } from './components/XPathResultCard';
import { ChatWidget } from './components/ChatWidget';
import { HistoryModal } from './components/HistoryModal';
import { SettingsModal } from './components/SettingsModal';
import { generateXPaths, TOOL_LANGUAGES } from './utils/xpathGenerator';
import { getHistory, saveHistoryItem, clearHistory, checkExpiration, updateLastActive } from './utils/historyStorage';
import { getStoredLanguage, saveLanguage, translations } from './utils/translations';
import { getStoredTool, saveStoredTool, getStoredLanguage as getStoredProgLang, saveStoredLanguage as saveStoredProgLang } from './utils/settingsStorage';
import { GeneratedLocator, HistoryItem, Language, TestTool, ProgrammingLanguage } from './types';

function App() {
  const [htmlInput, setHtmlInput] = useState('');
  const [results, setResults] = useState<GeneratedLocator[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Language (UI) & Framework (Tool/Code) State
  const [language, setLanguage] = useState<Language>(getStoredLanguage());
  const [tool, setTool] = useState<TestTool>(getStoredTool());
  const [progLang, setProgLang] = useState<ProgrammingLanguage>(getStoredProgLang());
  
  // History State
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const t = translations[language];

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'vi' : 'en';
    setLanguage(newLang);
    saveLanguage(newLang);
  };

  const handleToolChange = (newTool: TestTool) => {
    setTool(newTool);
    saveStoredTool(newTool);
    
    // Automatically switch programming language if the current one isn't supported by the new tool
    const supportedLangs = TOOL_LANGUAGES[newTool] || [];
    if (!supportedLangs.includes(progLang)) {
      const defaultLang = supportedLangs[0];
      if (defaultLang) {
        setProgLang(defaultLang);
        saveStoredProgLang(defaultLang);
      }
    }
  };

  const handleProgLangChange = (newLang: ProgrammingLanguage) => {
    setProgLang(newLang);
    saveStoredProgLang(newLang);
  };

  // Re-process results when language or framework changes
  useEffect(() => {
    if (htmlInput.trim()) {
      handleProcess();
    }
  }, [language, tool, progLang]);

  // Initialize history and check expiration periodically
  useEffect(() => {
    setHistoryItems(getHistory());
    const intervalId = setInterval(() => {
      if (checkExpiration()) {
        setHistoryItems([]);
      }
    }, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const handleProcess = (inputOverride?: string) => {
    const inputToProcess = inputOverride ?? htmlInput;

    if (!inputToProcess.trim()) {
      if (!inputOverride && htmlInput.trim() === '') {
        setError(t.input.error_empty);
        setResults([]);
      }
      return;
    }

    try {
      setError(null);
      if (!/<[a-z][\s\S]*>/i.test(inputToProcess)) {
        setError(t.input.error_invalid);
        setResults([]);
        return;
      }
      
      const generated = generateXPaths(inputToProcess, language, tool, progLang);
      if (generated.length === 0) {
        setError(t.input.error_failed);
      } else {
         const newItem: HistoryItem = {
           id: Date.now().toString(),
           htmlSnippet: inputToProcess,
           results: generated,
           timestamp: Date.now()
         };
         const updatedHistory = saveHistoryItem(newItem);
         setHistoryItems(updatedHistory);
      }
      setResults(generated);
    } catch (e) {
      setError("Failed to parse HTML.");
      console.error(e);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (htmlInput.trim()) {
        handleProcess();
      } else {
        if (htmlInput !== '') updateLastActive();
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [htmlInput]);

  const restoreHistoryItem = (item: HistoryItem) => {
    setHtmlInput(item.htmlSnippet);
    const generated = generateXPaths(item.htmlSnippet, language, tool, progLang);
    setResults(generated);
    setError(null);
    setIsHistoryOpen(false);
    updateLastActive();
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistoryItems([]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans">
      <Header 
        onHistoryClick={() => setIsHistoryOpen(true)} 
        onSettingsClick={() => setIsSettingsOpen(true)}
        language={language}
        onToggleLanguage={toggleLanguage}
        tool={tool}
        onToolChange={handleToolChange}
        progLang={progLang}
        onProgLangChange={handleProgLangChange}
      />
      
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="flex flex-col h-full">
          <div className="mb-2 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-700 flex items-center">
              <span className="bg-slate-200 text-slate-600 rounded-full w-6 h-6 flex items-center justify-center text-xs mr-2">1</span>
              {t.input.step}
            </h2>
            <button 
              onClick={() => { setHtmlInput(''); setResults([]); setError(null); }}
              className="text-xs text-slate-500 hover:text-red-500"
            >
              {t.input.clear}
            </button>
          </div>
          
          <div className="flex-1 bg-white border border-slate-300 rounded-xl shadow-sm overflow-hidden flex flex-col focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition">
            <div className="bg-slate-100 px-4 py-2 text-xs text-slate-500 border-b border-slate-200 font-mono">
              {t.input.label}
            </div>
            <textarea
              value={htmlInput}
              onChange={(e) => setHtmlInput(e.target.value)}
              placeholder={t.input.placeholder}
              className="flex-1 w-full p-4 font-mono text-sm resize-none outline-none text-slate-700 bg-white"
              spellCheck={false}
            />
          </div>
          <p className="mt-2 text-xs text-slate-400">
            {t.input.tip}
          </p>
        </div>

        <div className="flex flex-col h-full">
          <div className="mb-2">
            <h2 className="text-lg font-semibold text-slate-700 flex items-center">
              <span className="bg-slate-200 text-slate-600 rounded-full w-6 h-6 flex items-center justify-center text-xs mr-2">2</span>
              {t.results.step}
            </h2>
          </div>

          <div className="flex-1 bg-slate-100/50 rounded-xl border border-dashed border-slate-300 p-4 overflow-y-auto">
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm flex items-start">
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            {!htmlInput && !results.length && !error && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <svg className="w-16 h-16 mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm font-medium">{t.input.waiting}</p>
              </div>
            )}

            <div className="space-y-4">
              {results.map((result) => (
                <XPathResultCard 
                  key={result.id} 
                  result={result} 
                  rawHtml={htmlInput}
                  onOpenSettings={() => setIsSettingsOpen(true)}
                  language={language}
                />
              ))}
            </div>

            {results.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-200 text-center">
                 <p className="text-xs text-slate-400 mb-2">{t.results.unsatisfied}</p>
                 <p className="text-xs font-medium text-blue-600">{t.results.chat_tip}</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <ChatWidget language={language} />
      
      <HistoryModal 
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        historyItems={historyItems}
        onSelect={restoreHistoryItem}
        onClear={handleClearHistory}
        language={language}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        language={language}
      />
    </div>
  );
}

export default App;
