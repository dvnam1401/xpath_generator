
import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { XPathResultCard } from './components/XPathResultCard';
import { ChatWidget } from './components/ChatWidget';
import { HistoryModal } from './components/HistoryModal';
import { SettingsModal } from './components/SettingsModal';
import { POMModal } from './components/POMModal'; 
import { generateXPaths, TOOL_LANGUAGES } from './utils/xpathGenerator';
import { getHistory, saveHistoryItem, clearHistory, checkExpiration, updateLastActive } from './utils/historyStorage';
import { getStoredLanguage, saveLanguage, translations } from './utils/translations';
import { getStoredTool, saveStoredTool, getStoredProgLang, saveStoredProgLang } from './utils/settingsStorage';
import { generatePOM } from './utils/pomGenerator'; 
import { GeneratedLocator, HistoryItem, Language, TestTool, ProgrammingLanguage } from './types';

// Define ResultGroup props
interface ResultGroupProps {
  group: {name: string, items: GeneratedLocator[]};
  isRoot: boolean;
  htmlInput: string;
  onOpenSettings: () => void;
  language: Language;
}

// Move ResultGroup outside of App to avoid re-creation on every render
const ResultGroup: React.FC<ResultGroupProps> = ({ group, isRoot, htmlInput, onOpenSettings, language }) => {
  const [showAll, setShowAll] = useState(false);
  const itemsToShow = isRoot || showAll ? group.items : group.items.slice(0, 1);
  
  return (
    <div className="w-full relative">
      {!isRoot && (
         <div className="flex items-center mb-3">
           <div className="absolute -left-[31px] top-1/2 -translate-y-1/2 w-4 h-0.5 bg-slate-300"></div>
           <div className="absolute -left-[35px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-slate-400 rounded-full border-2 border-slate-50"></div>
           
           <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded border border-slate-200 uppercase tracking-tight shadow-sm">
             {group.name}
           </span>
         </div>
      )}

      <div className="space-y-3">
        {itemsToShow.map(result => (
          <XPathResultCard 
            key={result.id} 
            result={result} 
            rawHtml={htmlInput}
            onOpenSettings={onOpenSettings}
            language={language}
            variant={isRoot ? 'hero' : 'compact'}
          />
        ))}
        
        {!isRoot && group.items.length > 1 && (
           <button 
             onClick={() => setShowAll(!showAll)}
             className="text-[10px] text-blue-600 font-medium hover:underline flex items-center ml-1 bg-slate-50 px-2 py-1 rounded border border-slate-100 w-fit"
           >
             {showAll ? (
               <>
                 <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                 </svg>
                 Collapse
               </>
             ) : (
               <>
                  <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                 </svg>
                 Show {group.items.length - 1} more variants
               </>
             )}
           </button>
        )}
      </div>
    </div>
  );
};

function App() {
  const [htmlInput, setHtmlInput] = useState('');
  const [results, setResults] = useState<GeneratedLocator[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [deepScan, setDeepScan] = useState(false);
  const [filterText, setFilterText] = useState('');
  
  const [language, setLanguage] = useState<Language>(getStoredLanguage());
  const [tool, setTool] = useState<TestTool>(getStoredTool());
  const [progLang, setProgLang] = useState<ProgrammingLanguage>(getStoredProgLang());
  
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [isPOMOpen, setIsPOMOpen] = useState(false);
  const [pomCode, setPomCode] = useState('');

  const [groupedResults, setGroupedResults] = useState<{name: string, items: GeneratedLocator[]}[]>([]);

  const t = translations[language];

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'vi' : 'en';
    setLanguage(newLang);
    saveLanguage(newLang);
  };

  const handleToolChange = (newTool: TestTool) => {
    setTool(newTool);
    saveStoredTool(newTool);
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

  const handleExportPOM = () => {
    if (groupedResults.length === 0) return;
    
    // For each group, take the BEST (first) locator after filtering is applied
    // Or take all results if we want to export exactly what's visible?
    // Usually POM exports *all* found elements.
    
    // Strategy: Extract the first locator from *every* group found in deep scan
    const bestLocators = groupedResults.map(g => g.items[0]);
    
    const code = generatePOM(bestLocators, tool, progLang);
    setPomCode(code);
    setIsPOMOpen(true);
  };

  useEffect(() => {
    if (htmlInput.trim()) {
      handleProcess();
    }
  }, [language, tool, progLang, deepScan]);

  useEffect(() => {
    if (results.length === 0) {
      setGroupedResults([]);
      return;
    }

    const groups: Record<string, GeneratedLocator[]> = {};
    const order: string[] = [];

    results.forEach(res => {
      const key = res.elementName || 'ROOT_DEFAULT';
      if (!groups[key]) {
        groups[key] = [];
        order.push(key);
      }
      groups[key].push(res);
    });

    const groupedArray = order.map(key => ({
      name: key === 'ROOT_DEFAULT' ? (deepScan ? t.results.root_element : '') : key,
      items: groups[key]
    }));

    setGroupedResults(groupedArray);

  }, [results, deepScan, t.results.root_element]);

  const filteredGroupedResults = useMemo(() => {
    if (!filterText.trim()) return groupedResults;

    const lowerFilter = filterText.toLowerCase();

    return groupedResults.map(group => {
      if (group.name.toLowerCase().includes(lowerFilter)) {
        return group;
      }

      const matchingItems = group.items.filter(item => 
        item.value.toLowerCase().includes(lowerFilter) || 
        item.method.toLowerCase().includes(lowerFilter)
      );

      if (matchingItems.length > 0) {
        return { ...group, items: matchingItems };
      }

      return null;
    }).filter(g => g !== null) as {name: string, items: GeneratedLocator[]}[];

  }, [groupedResults, filterText]);


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
      // Relaxed check: if it contains < and > it might be HTML
      if (!/<[a-z][\s\S]*>/i.test(inputToProcess)) {
        setError(t.input.error_invalid);
        setResults([]);
        return;
      }
      
      const generated = generateXPaths(inputToProcess, language, tool, progLang, deepScan);
      
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
    const generated = generateXPaths(item.htmlSnippet, language, tool, progLang, deepScan);
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
      
      <main className="flex-1 max-w-[96%] 2xl:max-w-[1800px] w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-[calc(100vh-100px)] min-h-[600px]">
        
        <div className="flex flex-col h-full overflow-hidden lg:col-span-5">
          <div className="mb-2 flex justify-between items-center shrink-0">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-semibold text-slate-700 flex items-center">
                <span className="bg-slate-200 text-slate-600 rounded-full w-6 h-6 flex items-center justify-center text-xs mr-2">1</span>
                {t.input.step}
              </h2>
            </div>

            <button 
              onClick={() => { setHtmlInput(''); setResults([]); setError(null); }}
              className="text-xs text-slate-500 hover:text-red-500"
            >
              {t.input.clear}
            </button>
          </div>
          
          <div className="flex-1 bg-white border border-slate-300 rounded-xl shadow-sm overflow-hidden flex flex-col focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition relative">
            <div className="bg-slate-50 px-3 py-2 text-xs text-slate-500 border-b border-slate-200 font-mono flex justify-between items-center shrink-0">
              <span>{t.input.label}</span>
              <label className="flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={deepScan} 
                    onChange={(e) => setDeepScan(e.target.checked)} 
                    className="sr-only peer" 
                  />
                  <div className="w-7 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] relative after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600 mr-1.5"></div>
                  <span className={`text-[10px] font-medium ${deepScan ? 'text-blue-600' : 'text-slate-400'}`}>{t.input.deep_scan}</span>
              </label>
            </div>
            <textarea
              value={htmlInput}
              onChange={(e) => setHtmlInput(e.target.value)}
              placeholder={t.input.placeholder}
              className="flex-1 w-full p-4 font-mono text-xs leading-relaxed resize-none outline-none text-slate-700 bg-white"
              spellCheck={false}
            />
            {!htmlInput && (
              <div className="absolute inset-0 top-10 pointer-events-none flex items-center justify-center opacity-30">
                 <svg className="w-12 h-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                 </svg>
              </div>
            )}
          </div>
          <p className="mt-2 text-[10px] text-slate-400 shrink-0 text-center">
            {t.input.tip}
          </p>
        </div>

        <div className="flex flex-col h-full overflow-hidden lg:col-span-7">
          <div className="mb-2 shrink-0 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2">
            <h2 className="text-lg font-semibold text-slate-700 flex items-center shrink-0">
              <span className="bg-slate-200 text-slate-600 rounded-full w-6 h-6 flex items-center justify-center text-xs mr-2">2</span>
              {t.results.step}
            </h2>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
                {results.length > 0 && deepScan && (
                  <button
                    onClick={handleExportPOM}
                    className="shrink-0 bg-indigo-50 text-indigo-600 text-xs font-bold px-3 py-1.5 rounded border border-indigo-200 hover:bg-indigo-100 transition flex items-center"
                  >
                    <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {t.results.export_pom}
                  </button>
                )}

                {results.length > 0 && (
                  <div className="relative flex-1 sm:w-64">
                    <input
                      type="text"
                      value={filterText}
                      onChange={(e) => setFilterText(e.target.value)}
                      placeholder={t.results.search_placeholder}
                      className="w-full bg-white text-xs pl-8 pr-3 py-1.5 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700 placeholder-slate-400"
                    />
                    <svg 
                      className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    {filterText && (
                      <button 
                        onClick={() => setFilterText('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                )}
            </div>
          </div>

          <div className="flex-1 bg-slate-100/50 rounded-xl border border-dashed border-slate-300 p-4 md:p-6 overflow-y-auto custom-scrollbar">
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm flex items-start">
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            {!htmlInput && groupedResults.length === 0 && !error && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <p className="text-sm font-medium">{t.input.waiting}</p>
              </div>
            )}

            <div className="w-full">
              {htmlInput && groupedResults.length > 0 && filteredGroupedResults.length === 0 && (
                 <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <svg className="w-10 h-10 mb-2 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p className="text-sm">{t.results.no_results}</p>
                 </div>
              )}

              {filteredGroupedResults.length > 0 && (
                <>
                  {filteredGroupedResults[0].name === (deepScan ? t.results.root_element : 'ROOT_DEFAULT') && (
                    <div className="mb-8">
                      <ResultGroup 
                        group={filteredGroupedResults[0]} 
                        isRoot={true} 
                        htmlInput={htmlInput}
                        onOpenSettings={() => setIsSettingsOpen(true)}
                        language={language}
                      />
                    </div>
                  )}

                  {(filteredGroupedResults.length > 1 || (filteredGroupedResults.length === 1 && filteredGroupedResults[0].name !== (deepScan ? t.results.root_element : 'ROOT_DEFAULT'))) && (
                    <div className="mt-4">
                      <div className="flex items-center mb-4 px-1">
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded border border-slate-200 z-10 shadow-sm">
                           {filterText ? 'Matches' : 'Inner Elements'}
                         </span>
                         <div className="h-px bg-slate-200 flex-1 ml-2"></div>
                      </div>
                      
                      <div className="ml-4 pl-6 border-l-2 border-slate-200 space-y-8 pb-4">
                        {filteredGroupedResults.map((group, idx) => {
                           if (group.name === (deepScan ? t.results.root_element : 'ROOT_DEFAULT')) return null;
                           
                           return (
                             <ResultGroup 
                               key={idx} 
                               group={group} 
                               isRoot={false} 
                               htmlInput={htmlInput}
                               onOpenSettings={() => setIsSettingsOpen(true)}
                               language={language}
                             />
                           );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {results.length > 0 && (
              <div className="mt-8 pt-4 border-t border-slate-200 text-center pb-4">
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

      <POMModal
        isOpen={isPOMOpen}
        onClose={() => setIsPOMOpen(false)}
        code={pomCode}
        language={language}
      />
    </div>
  );
}

export default App;
