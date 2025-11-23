
import React, { useState } from 'react';
import { GeneratedLocator, PriorityLevel, Language } from '../types';
import { generateExplanation } from '../services/geminiService';
import { hasApiKey, getStoredTool, getStoredProgLang } from '../utils/settingsStorage';
import { translations } from '../utils/translations';

interface Props {
  result: GeneratedLocator;
  rawHtml: string;
  onOpenSettings: () => void;
  language: Language;
  variant?: 'hero' | 'compact'; // New prop for visual hierarchy
}

export const XPathResultCard: React.FC<Props> = ({ 
  result, 
  rawHtml, 
  onOpenSettings, 
  language,
  variant = 'hero'
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLocator, setCopiedLocator] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  
  const t = translations[language].card;
  const isCompact = variant === 'compact';
  
  const currentTool = getStoredTool();
  const currentLang = getStoredProgLang();
  const frameworkLabel = `${currentTool} ${currentLang}`.toUpperCase();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(result.codeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLocator = () => {
    navigator.clipboard.writeText(result.value);
    setCopiedLocator(true);
    setTimeout(() => setCopiedLocator(false), 2000);
  };

  const handleExplain = async () => {
    if (!hasApiKey()) {
      onOpenSettings();
      return;
    }

    if (explanation) {
      setShowExplanation(!showExplanation);
      return;
    }

    setLoading(true);
    setShowExplanation(true);
    try {
      const promptText = `Method: ${result.method}, Value: ${result.value}. ${result.description}`;
      const text = await generateExplanation(promptText, rawHtml, language);
      setExplanation(text);
    } catch (e) {
      setExplanation(t.error_ai);
    } finally {
      setLoading(false);
    }
  };

  const getMethodBadgeColor = (method: string) => {
    switch (method) {
      case 'id': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'role': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'name': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'linkText': return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'css': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'xpath': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'label': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'placeholder': return 'bg-teal-100 text-teal-800 border-teal-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStabilityColor = (stability: string) => {
    if (stability === 'High') return 'text-green-600';
    if (stability === 'Medium') return 'text-yellow-600';
    return 'text-red-600 font-bold';
  };

  const isBestChoice = result.priority === PriorityLevel.PLAYWRIGHT_ROLE || 
                       result.priority === PriorityLevel.ROBUST_ID || 
                       result.priority === PriorityLevel.NAME;

  // Conditional Styles
  const containerClasses = isCompact 
    ? `w-full bg-slate-50 rounded border border-slate-200 p-4 hover:border-blue-300 transition-colors ${result.stability === 'Low' ? 'bg-red-50/30' : ''}`
    : `w-full bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow p-5 ${result.stability === 'Low' ? 'border-red-200 bg-red-50/10' : 'border-slate-200 shadow-sm'}`;

  return (
    <div className={containerClasses}>
      
      {/* Header Row */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2 overflow-hidden">
          {/* In Compact mode, Element Name is the title. */}
          {isCompact && result.elementName && (
             <span className="text-xs font-bold text-slate-700 uppercase tracking-tight mr-1 truncate max-w-[200px]" title={result.elementName}>
               {result.elementName}
             </span>
          )}

          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider shrink-0 ${getMethodBadgeColor(result.method)}`}>
            {result.method}
          </span>
          
          {isBestChoice && !isCompact && (
            <span className="flex items-center text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 shrink-0">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              {t.best_choice}
            </span>
          )}
        </div>

        <div className={`text-[10px] flex items-center shrink-0 ${getStabilityColor(result.stability)}`}>
           {result.stability === 'Low' && (
             <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
             </svg>
           )}
          <span className={`w-1.5 h-1.5 rounded-full mr-1 ${result.stability === 'High' ? 'bg-green-500' : result.stability === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
          {isCompact ? result.stability : (result.stability === 'High' ? t.stability_high : result.stability === 'Medium' ? t.stability_med : t.stability_low)}
        </div>
      </div>

      {/* Code Snippet */}
      <div className="relative group/code">
         <div className="flex justify-between items-center mb-1 px-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{frameworkLabel}</span>
         </div>
         <code className={`block bg-slate-800 text-blue-300 rounded border border-slate-700 font-mono break-all shadow-inner relative pr-8 ${isCompact ? 'text-[11px] p-3' : 'text-xs p-3.5'}`}>
           {result.codeSnippet}
            <button
              onClick={handleCopyCode}
              className={`absolute top-1/2 -translate-y-1/2 right-1 p-1.5 bg-slate-700 border border-slate-600 rounded hover:bg-slate-600 transition shadow-sm opacity-0 group-hover/code:opacity-100 focus:opacity-100 ${copiedCode ? 'text-emerald-400' : 'text-slate-300'}`}
              title={t.copy_tooltip}
            >
              {copiedCode ? (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
         </code>
      </div>

      {/* Locator Value */}
      <div className="relative group/locator mt-4">
           <div className="flex justify-between items-center mb-1 px-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Locator Value</span>
           </div>
           <code className={`block bg-slate-50 text-slate-700 rounded-md border border-slate-200 font-mono break-all relative pr-8 ${isCompact ? 'text-[11px] p-2' : 'text-xs p-2.5'}`}>
             {result.value}
             <button
              onClick={handleCopyLocator}
              className={`absolute top-1/2 -translate-y-1/2 right-1 p-1 bg-white border border-slate-200 rounded hover:bg-slate-50 transition shadow-sm opacity-0 group-hover/locator:opacity-100 focus:opacity-100 ${copiedLocator ? 'text-emerald-500 border-emerald-200' : 'text-slate-400'}`}
              title={t.copy_tooltip}
            >
              {copiedLocator ? (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
           </code>
      </div>

      {/* Footer / Description */}
      <div className={`flex flex-wrap gap-2 items-center justify-between border-slate-100 ${isCompact ? 'mt-3 pt-3 border-t' : 'mt-4 pt-4 border-t'}`}>
        <p className={`text-slate-500 leading-relaxed ${isCompact ? 'text-[10px] truncate max-w-[70%]' : 'text-xs flex-1 min-w-[200px]'}`}>
          {result.description}
        </p>
        
        <button 
          onClick={handleExplain}
          className={`flex items-center text-[10px] text-purple-600 hover:text-purple-700 font-medium transition whitespace-nowrap bg-purple-50 rounded hover:bg-purple-100 ${isCompact ? 'px-2 py-1' : 'px-3 py-1.5'}`}
        >
          {!isCompact && (
            <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          )}
          {t.explain_btn}
        </button>
      </div>

      {showExplanation && (
        <div className="mt-3 bg-indigo-50 rounded-lg p-3 border border-indigo-100 text-xs text-slate-700 animate-fadeIn">
          {loading ? (
            <div className="flex items-center space-x-2 text-indigo-400">
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <span>{t.analyzing}</span>
            </div>
          ) : (
            <div>
              <div className="uppercase tracking-wider text-[10px] font-bold text-indigo-500 mb-1">{t.analysis_title}</div>
              <div className="prose prose-sm max-w-none whitespace-pre-wrap font-sans text-slate-700 text-xs leading-relaxed">
                {explanation}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
