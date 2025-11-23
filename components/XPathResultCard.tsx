import React, { useState } from 'react';
import { XPathResult, PriorityLevel } from '../types';

interface Props {
  result: XPathResult;
}

export const XPathResultCard: React.FC<Props> = ({ result }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.xpath);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getBadgeColor = (category: string) => {
    switch (category) {
      case 'ID': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Text': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Attribute': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Combo': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeColor(result.category)}`}>
          {result.category}
        </span>
        {result.priority === PriorityLevel.ID && (
          <span className="flex items-center text-xs text-emerald-600 font-medium">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            Best Choice
          </span>
        )}
      </div>

      <div className="relative group">
        <code className="block bg-slate-50 text-slate-800 p-3 rounded border border-slate-200 font-mono text-sm break-all">
          {result.xpath}
        </code>
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 p-1.5 bg-white border border-slate-200 rounded hover:bg-slate-50 transition shadow-sm"
          title="Copy to clipboard"
        >
          {copied ? (
            <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>
      </div>

      <div className="mt-3 flex items-end justify-between">
        <p className="text-sm text-slate-500">{result.description}</p>
      </div>
    </div>
  );
};