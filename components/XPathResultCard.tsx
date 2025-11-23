
import React, { useState } from 'react';
import { GeneratedLocator, PriorityLevel, Language } from '../types';
import { generateExplanation } from '../services/geminiService';
import { hasApiKey, getStoredTool, getStoredLanguage } from '../utils/settingsStorage';
import { translations } from '../utils/translations';

interface Props {
  result: GeneratedLocator;
  rawHtml: string;
  onOpenSettings: () => void;
  language: Language;
}

export const XPathResultCard: React.FC<Props> = ({ result, rawHtml, onOpenSettings, language }) => {
  const [copied, setCopied] = useState(false);
  const [copiedValue, setCopiedValue] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  
  const t = translations[language].card;
  
  // Retrieve current settings to display label properly if needed, 
  // though ideally passed via props, reading from storage matches current architecture
  const currentTool = getStoredTool();
  const currentLang = getStoredLanguage();
  const frameworkLabel = `${currentTool} ${currentLang}`.toUpperCase();

  const handleCopy = () => {
    navigator.clipboard.writeText(result.codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyValue = () => {
    navigator.clipboard.writeText(result.value);
    setCopiedValue(true);
    setTimeout(() => setCopiedValue(false), 2000);
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
      const promptText = `Method: By.${result.method}, Value: ${result.value}. ${result.description}`;
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
      case 'name': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'linkText': return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'css': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'xpath': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStabilityColor = (stability: string) => {
    if (stability === 'High') return 'text-green-600';
    if (stability === 'Medium') return 'text-yellow-600';
    return 'text-red-600 font-bold';
  };

  const isBestChoice = result.priority === PriorityLevel.ROBUST_ID || result.priority === PriorityLevel.NAME;

  return (
    <div className={`bg-white rounded-lg border shadow-sm p-4 hover:shadow-md transition-shadow ${result.stability === 'Low' ? 'border-red-200 bg-red-50/10' : 'border-slate-200'}`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex space-x-2">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${getMethodBadgeColor(result.method)}`}>
            {result.method}
          </span>
          {isBestChoice && (
            <span className="flex items-center text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              {t.best_choice}
            </span>
          )}
        </div>
        <div className={`text-xs flex items-center ${getStabilityColor(result.stability)}`}>
          <span className={`w-2 h-2 rounded-full mr-1.5 ${result.stability === 'High' ? 'bg-green-500' : result.stability === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
          {result.stability === 'High' ? t.stability_high : result.stability === 'Medium' ? t.stability_med : t.stability_low}
        </div>
      </div>

      <div className="space-y-3">
        <div className="relative group">
           <div className="flex justify-between items-center mb-1 px-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{frameworkLabel}</span>
           </div>
           <code className="block bg-slate-800 text-blue-300 p-3 rounded-md border border-slate-700 font-mono text-xs break-all shadow-inner relative">
             {result.codeSnippet}
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2 p-1.5 bg-slate-700 border border-slate-600 rounded hover:bg-slate-600 transition shadow-sm opacity-0 group-hover:opacity-100 focus:opacity-100"
                title={t.copy_tooltip}
              >
                {copied ? (
                  <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
           </code>
        </div>

        <div className="relative group">
           <div className="flex justify-between items-center mb-1 px-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Selector (DevTools)</span>
           </div>
           <code className="block bg-slate-50 text-slate-700 p-2 rounded-md border border-slate-200 font-mono text-xs break-all relative">
             {result.value}
             <button
                onClick={handleCopyValue}
                className="absolute top-1.5 right-1.5 p-1 bg-white border border-slate-200 rounded hover:bg-slate-100 transition shadow-sm opacity-0 group-hover:opacity-100 focus:opacity-100"
                title="Copy Selector"
              >
                 {copiedValue ? (
                  <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
           </code>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 items-end justify-between border-t border-slate-100 pt-3">
        <p className="text-xs text-slate-500 flex-1 min-w-[200px] leading-relaxed">
          {result.description}
        </p>
        <button 
          onClick={handleExplain}
          className="flex items-center text-xs text-purple-600 hover:text-purple-700 font-medium transition whitespace-nowrap bg-purple-50 px-2 py-1 rounded hover:bg-purple-100"
        >
          <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
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
