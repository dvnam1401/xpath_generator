
import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../utils/translations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  code: string;
  language: Language;
}

export const POMModal: React.FC<Props> = ({ isOpen, onClose, code, language }) => {
  const [copied, setCopied] = useState(false);
  const t = translations[language];

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-semibold text-slate-800 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {t.results.pom_export || "Page Object Model"}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition p-1 rounded-full hover:bg-slate-200">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-0 bg-slate-900">
          <pre className="p-4 text-sm font-mono text-blue-300 leading-relaxed whitespace-pre-wrap">
            {code}
          </pre>
        </div>

        <div className="p-4 border-t border-slate-100 bg-white flex justify-end">
            <button 
              onClick={handleCopy}
              className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition flex items-center ${copied ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {t.card.copied}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  {t.card.copy_tooltip}
                </>
              )}
            </button>
        </div>
      </div>
    </div>
  );
};
