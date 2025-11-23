import React from 'react';
import { Language } from '../types';
import { translations } from '../utils/translations';

interface Props {
  onHistoryClick: () => void;
  onSettingsClick: () => void;
  language: Language;
  onToggleLanguage: () => void;
}

export const Header: React.FC<Props> = ({ onHistoryClick, onSettingsClick, language, onToggleLanguage }) => {
  const t = translations[language].header;

  return (
    <header className="bg-slate-900 text-white p-4 shadow-md sticky top-0 z-20">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
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
        <div className="flex items-center space-x-4 md:space-x-6 text-sm font-medium text-slate-300">
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

          {/* Mobile Menu Icons for History/Settings */}
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