
import React from 'react';
import { Language, TestTool, ProgrammingLanguage } from '../types';
import { translations } from '../utils/translations';
import { TOOL_LANGUAGES } from '../utils/xpathGenerator';

interface Props {
  onHistoryClick: () => void;
  onSettingsClick: () => void;
  language: Language;
  onToggleLanguage: () => void;
  tool: TestTool;
  onToolChange: (t: TestTool) => void;
  progLang: ProgrammingLanguage;
  onProgLangChange: (l: ProgrammingLanguage) => void;
}

export const Header: React.FC<Props> = ({ 
  onHistoryClick, 
  onSettingsClick, 
  language, 
  onToggleLanguage,
  tool,
  onToolChange,
  progLang,
  onProgLangChange
}) => {
  const t = translations[language].header;

  const availableLanguages = TOOL_LANGUAGES[tool] || [];

  return (
    <header className="bg-slate-900 text-white p-4 shadow-md sticky top-0 z-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="bg-blue-600 p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{t.title}</h1>
            <p className="text-xs text-slate-400 hidden sm:block">{t.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center justify-between w-full md:w-auto space-x-3 md:space-x-6 text-sm font-medium text-slate-300">
          
          {/* Tool & Language Selectors Group */}
          <div className="flex items-center space-x-2">
            {/* Tool Selector */}
            <div className="relative">
               <select 
                 value={tool}
                 onChange={(e) => onToolChange(e.target.value as TestTool)}
                 className="bg-slate-800 text-slate-200 text-xs py-1.5 pl-2 pr-8 rounded border border-slate-700 focus:ring-1 focus:ring-blue-500 outline-none appearance-none cursor-pointer hover:bg-slate-700 transition uppercase font-bold tracking-wide"
               >
                 <option value="selenium">Selenium</option>
                 <option value="playwright">Playwright</option>
                 <option value="cypress">Cypress</option>
                 <option value="appium">Appium</option>
                 <option value="katalon">Katalon</option>
                 <option value="robot">Robot Framework</option>
               </select>
               <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                 <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                 </svg>
               </div>
            </div>

            {/* Language Selector */}
            <div className="relative">
               <select 
                 value={progLang}
                 onChange={(e) => onProgLangChange(e.target.value as ProgrammingLanguage)}
                 className="bg-slate-800 text-slate-200 text-xs py-1.5 pl-2 pr-8 rounded border border-slate-700 focus:ring-1 focus:ring-blue-500 outline-none appearance-none cursor-pointer hover:bg-slate-700 transition capitalize"
               >
                 {availableLanguages.map(lang => (
                   <option key={lang} value={lang}>{lang}</option>
                 ))}
               </select>
               <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                 <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                 </svg>
               </div>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-700 hidden md:block"></div>

          <button 
            onClick={onToggleLanguage}
            className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-slate-800 transition"
          >
             <span className={`text-xs ${language === 'en' ? 'text-white font-bold' : 'text-slate-500'}`}>EN</span>
             <span className="text-slate-600">/</span>
             <span className={`text-xs ${language === 'vi' ? 'text-white font-bold' : 'text-slate-500'}`}>VN</span>
          </button>
          
          <div className="hidden md:flex space-x-6">
            <button className="hover:text-white cursor-pointer transition focus:outline-none">{t.generator}</button>
            <button onClick={onHistoryClick} className="hover:text-white cursor-pointer transition focus:outline-none flex items-center">
               {t.history}
            </button>
            <button onClick={onSettingsClick} className="hover:text-white cursor-pointer transition focus:outline-none">{t.settings}</button>
          </div>

          {/* Mobile Menu Icons */}
          <div className="flex md:hidden space-x-4">
             <button onClick={onHistoryClick} className="hover:text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
             </button>
             <button onClick={onSettingsClick} className="hover:text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
             </button>
          </div>
        </div>
      </div>
    </header>
  );
};
