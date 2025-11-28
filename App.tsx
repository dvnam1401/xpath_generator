
import React, { useState, useEffect, useMemo, useRef } from 'react';
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
import { GeneratedLocator, HistoryItem, Language, TestTool, ProgrammingLanguage, PriorityLevel } from './types';

// Define ResultGroup props
interface ResultGroupProps {
  group: {name: string, items: GeneratedLocator[]};
  isRoot: boolean;
  htmlInput: string;
  onOpenSettings: () => void;
  language: Language;
  id?: string; // For scrolling
}

// Move ResultGroup outside of App to avoid re-creation on every render
const ResultGroup: React.FC<ResultGroupProps> = ({ group, isRoot, htmlInput, onOpenSettings, language, id }) => {
  const [showAll, setShowAll] = useState(false);
  const itemsToShow = isRoot || showAll ? group.items : group.items.slice(0, 1);
  
  return (
    // Increased scroll-mt to 48 (approx 190px) to ensure the element isn't hidden behind the sticky header when jumping
    <div id={id} className="w-full relative scroll-mt-48 transition-all duration-500">
      {!isRoot && (
         <div className="flex items-center mb-3 group/marker">
           <div className="absolute -left-[31px] top-1/2 -translate-y-1/2 w-4 h-0.5 bg-slate-300 group-hover/marker:bg-blue-400 transition-colors"></div>
           <div className="absolute -left-[35px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-slate-400 rounded-full border-2 border-slate-50 group-hover/marker:bg-blue-500 transition-colors"></div>
           
           <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded border border-slate-200 uppercase tracking-tight shadow-sm group-hover/marker:text-blue-600 group-hover/marker:border-blue-200 transition-colors">
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
             className="text-[10px] text-blue-600 font-medium hover:underline flex items-center ml-1 bg-slate-50 px-2 py-1 rounded border border-slate-100 w-fit hover:bg-blue-50 transition-colors"
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
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [hideUnstable, setHideUnstable] = useState(false);
  
  const [language, setLanguage] = useState<Language>(getStoredLanguage());
  const [tool, setTool] = useState<TestTool>(getStoredTool());
  const [progLang, setProgLang] = useState<ProgrammingLanguage>(getStoredProgLang());
  
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [isPOMOpen, setIsPOMOpen] = useState(false);
  const [pomCode, setPomCode] = useState('');

  const [groupedResults, setGroupedResults] = useState<{name: string, items: GeneratedLocator[]}[]>([]);

  // Refs for scrolling
  const innerListRef = useRef<HTMLDivElement>(null);

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
      setActiveCategory('All'); // Reset category on new results
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

  // Helper to determine category for filtering
  const getCategoryFromTag = (tag?: string) => {
    if (!tag) return 'Other';
    const t = tag.toLowerCase();
    if (t === 'a') return 'Link';
    if (t === 'button' || (t === 'input' && ['submit','button','reset'].includes(''))) return 'Button'; // Type check omitted for simplicity
    if (['input', 'textarea', 'select'].includes(t)) return 'Input';
    if (['img', 'svg'].includes(t)) return 'Image';
    if (['h1','h2','h3','h4','h5','h6','p','span','div','li','td','label','strong','b'].includes(t)) return 'Text';
    return 'Other';
  };

  // Extract categories from results
  const categories = useMemo(() => {
    const stats: Record<string, number> = { 'All': 0 };
    
    groupedResults.forEach(group => {
      if (!group.items.length) return;
      // Assume all items in a group belong to same element type
      const tag = group.items[0].tagName;
      const cat = getCategoryFromTag(tag);
      
      stats['All']++;
      stats[cat] = (stats[cat] || 0) + 1;
    });

    // Sort: All first, then by count descending
    return Object.entries(stats)
      .filter(([_, count]) => count > 0)
      .sort((a, b) => {
        if (a[0] === 'All') return -1;
        if (b[0] === 'All') return 1;
        return b[1] - a[1];
      });
  }, [groupedResults]);

  const filteredGroupedResults = useMemo(() => {
    const lowerFilter = filterText.toLowerCase().trim();

    return groupedResults.map(group => {
      // 1. Filter by Category
      if (activeCategory !== 'All') {
        const tag = group.items[0]?.tagName;
        if (getCategoryFromTag(tag) !== activeCategory) {
          return null;
        }
      }

      // 2. Filter by Search Text (Group Name Match)
      const matchesGroupText = !lowerFilter || group.name.toLowerCase().includes(lowerFilter);

      // 3. Filter Items within Group
      const filteredItems = group.items.filter(item => {
        // Stability Filter: Strict High Check if filter enabled
        if (hideUnstable && item.stability !== 'High') {
          return false;
        }
        
        // Text Filter (if group name matched, show all valid items; else filter by locator value)
        if (!matchesGroupText) {
           return item.value.toLowerCase().includes(lowerFilter) || 
                  item.method.toLowerCase().includes(lowerFilter);
        }
        
        return true;
      });

      if (filteredItems.length === 0) return null;

      return { ...group, items: filteredItems };
    }).filter(g => g !== null) as {name: string, items: GeneratedLocator[]}[];

  }, [groupedResults, filterText, activeCategory, hideUnstable]);

  const handleJumpTo = (groupId: string) => {
    const element = document.getElementById(groupId);
    if (element && innerListRef.current) {
        // Scroll the specific container, not the window
        // block: 'start' aligns it to the top of the scroll container
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Add simple highlight effect
        element.classList.add('ring-2', 'ring-blue-400', 'ring-offset-2');
        setTimeout(() => element.classList.remove('ring-2', 'ring-blue-400', 'ring-offset-2'), 2000);
    }
  };

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

  // Split results: 
  const unfilteredRootName = groupedResults.length > 0 ? groupedResults[0].name : null;
  const rootGroup = filteredGroupedResults.find(g => g.name === unfilteredRootName);
  const innerGroups = filteredGroupedResults.filter(g => g !== rootGroup);

  return (
    // LOCKED SCREEN: h-screen and overflow-hidden on root ensures page doesn't scroll
    <div className="h-screen flex flex-col bg-slate-50 text-slate-800 font-sans overflow-hidden">
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
      
      {/* Main Content Area */}
      <main className="flex-1 max-w-[96%] 2xl:max-w-[1800px] w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-full min-h-0">
        
        {/* LEFT COLUMN: INPUT */}
        <div className="flex flex-col h-full overflow-hidden lg:col-span-5 min-h-0">
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

        {/* RIGHT COLUMN: RESULTS */}
        <div className="flex flex-col h-full overflow-hidden lg:col-span-7 min-h-0">
          
          {/* Unified Scroll Container */}
          <div className="flex-1 bg-slate-100/50 rounded-xl border border-dashed border-slate-300 flex flex-col overflow-hidden relative">
            
            <div 
              ref={innerListRef}
              className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth"
            >
              {/* Sticky Header Section */}
              <div className="sticky top-0 z-30 bg-slate-50 border-b border-slate-200/60 shadow-sm px-4 md:px-6 pt-4 pb-3">
                  <div className="flex justify-between items-center mb-2">
                      <h2 className="text-lg font-semibold text-slate-700 flex items-center shrink-0">
                        <span className="bg-slate-200 text-slate-600 rounded-full w-6 h-6 flex items-center justify-center text-xs mr-2">2</span>
                        {t.results.step}
                        {results.length > 0 && (
                          <span className="ml-2 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                            {results.length}
                          </span>
                        )}
                      </h2>
                      
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
                  </div>

                  {results.length > 0 && (
                    <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm space-y-2">
                      
                      {/* Row 1: Search & Jump To */}
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                            <input
                              type="text"
                              value={filterText}
                              onChange={(e) => setFilterText(e.target.value)}
                              placeholder={t.results.search_placeholder}
                              className="w-full bg-slate-50 text-xs pl-8 pr-3 py-1.5 rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700 placeholder-slate-400"
                            />
                            <svg className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            {filterText && (
                              <button onClick={() => setFilterText('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            )}
                        </div>

                        {deepScan && groupedResults.length > 1 && (
                          <div className="relative w-1/3 min-w-[140px]">
                            <select 
                              onChange={(e) => { 
                                if (e.target.value) {
                                  handleJumpTo(e.target.value);
                                  e.target.value = ""; // Reset
                                }
                              }}
                              className="w-full bg-slate-50 text-xs pl-2 pr-6 py-1.5 rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700 appearance-none cursor-pointer truncate"
                            >
                              <option value="">{t.results.jump_to}</option>
                              {groupedResults.map((group, idx) => (
                                <option key={idx} value={`group-${idx}`}>
                                  {group.name}
                                </option>
                              ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Row 2: Filter Chips & Toggle */}
                      <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar max-w-full">
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mr-1 shrink-0">{t.results.filter}</span>
                            {categories.map(([cat, count]) => (
                              <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`text-[10px] px-2.5 py-0.5 rounded-full border whitespace-nowrap transition-colors ${
                                  activeCategory === cat 
                                    ? 'bg-blue-100 text-blue-700 border-blue-200 font-semibold' 
                                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                {cat} <span className="opacity-60 ml-0.5 text-[9px]">({count})</span>
                              </button>
                            ))}
                        </div>
                        
                        <label className="flex items-center cursor-pointer shrink-0 ml-2">
                            <input 
                              type="checkbox" 
                              checked={hideUnstable} 
                              onChange={(e) => setHideUnstable(e.target.checked)} 
                              className="sr-only peer" 
                            />
                            <div className="w-6 h-3 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] relative after:bg-white after:border-gray-300 after:border after:rounded-full after:h-2 after:w-2 after:transition-all peer-checked:bg-green-500 mr-1.5"></div>
                            <span className={`text-[9px] font-medium uppercase tracking-tight ${hideUnstable ? 'text-green-600' : 'text-slate-400'}`}>{t.results.unstable_hide}</span>
                        </label>
                      </div>
                    </div>
                  )}
              </div>

              {/* Scrollable Content */}
              <div className="p-4 md:p-6 pb-20">
                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm flex items-start mb-6">
                    <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                  </div>
                )}

                {/* Empty State */}
                {!htmlInput && groupedResults.length === 0 && !error && (
                  <div className="flex flex-col items-center justify-center text-slate-400 py-12">
                    <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium">{t.input.waiting}</p>
                  </div>
                )}

                {/* No Results Filter State */}
                {htmlInput && groupedResults.length > 0 && filteredGroupedResults.length === 0 && (
                   <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                      <svg className="w-10 h-10 mb-2 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <p className="text-sm">{t.results.no_results}</p>
                   </div>
                )}

                {/* Results List */}
                {filteredGroupedResults.length > 0 && (
                  <>
                    {/* Fixed Root Element (if exists) */}
                    {rootGroup && (
                      <div className="mb-8">
                         <ResultGroup 
                            group={rootGroup} 
                            isRoot={true} 
                            htmlInput={htmlInput}
                            onOpenSettings={() => setIsSettingsOpen(true)}
                            language={language}
                            id="group-0"
                          />
                      </div>
                    )}

                    {/* Scrollable Inner Elements */}
                    {innerGroups.length > 0 && (
                      <div className="pt-2">
                        {/* Sticky Section Header inside scroll view */}
                        <div className="flex items-center mb-6 px-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded border border-slate-200 shadow-sm">
                              {activeCategory === 'All' ? 'Inner Elements' : `${activeCategory} Elements`}
                            </span>
                            <div className="h-px bg-slate-200 flex-1 ml-2"></div>
                        </div>
                        
                        <div className="ml-4 pl-6 border-l-2 border-slate-200 space-y-10 pb-4">
                          {innerGroups.map((group) => {
                              // Find original index for ID mapping
                              const originalIndex = groupedResults.findIndex(g => g.name === group.name);
                              return (
                                <ResultGroup 
                                  key={originalIndex} 
                                  group={group} 
                                  isRoot={false} 
                                  htmlInput={htmlInput}
                                  onOpenSettings={() => setIsSettingsOpen(true)}
                                  language={language}
                                  id={`group-${originalIndex}`}
                                />
                              );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Chat Tip Footer */}
                    <div className="mt-8 pt-4 border-t border-slate-200 text-center pb-4 text-xs font-medium text-blue-600/70">
                        {t.results.chat_tip}
                    </div>
                  </>
                )}
              </div>
            </div>
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
