import React from 'react';
import { HistoryItem } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  historyItems: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
}

export const HistoryModal: React.FC<Props> = ({ isOpen, onClose, historyItems, onSelect, onClear }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-semibold text-slate-800 flex items-center">
            <svg className="w-5 h-5 mr-2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Recent Activity
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition p-1 rounded-full hover:bg-slate-200">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
          {historyItems.length === 0 ? (
            <div className="text-center py-12 text-slate-400 flex flex-col items-center">
              <svg className="w-12 h-12 mb-3 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>No history found.</p>
              <p className="text-xs mt-1 text-slate-400">History is automatically cleared after 15 minutes of inactivity.</p>
            </div>
          ) : (
            historyItems.map((item) => (
              <div 
                key={item.id} 
                onClick={() => onSelect(item)}
                className="group border border-slate-200 rounded-lg p-3 hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition flex flex-col sm:flex-row gap-3 items-start sm:items-center"
              >
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex items-center justify-between sm:justify-start sm:space-x-3 mb-1.5">
                    <span className="text-xs font-mono text-slate-400 flex items-center">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                      {item.results.length} Results
                    </span>
                  </div>
                  <code className="block text-xs text-slate-700 font-mono truncate bg-slate-50 p-1.5 rounded border border-slate-100 w-full">
                    {item.htmlSnippet.trim().substring(0, 150) || '<empty>'}
                  </code>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity self-end sm:self-center">
                   <span className="text-blue-600 text-xs font-semibold px-3 py-1 bg-blue-100 rounded-full">Load</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-3 border-t border-slate-100 bg-slate-50 flex justify-between items-center text-xs">
            <span className="text-slate-400 flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              Auto-expires after 15m inactivity
            </span>
            {historyItems.length > 0 && (
                <button 
                  onClick={onClear}
                  className="text-red-500 hover:text-red-700 font-medium px-2 py-1 hover:bg-red-50 rounded transition"
                >
                  Clear History
                </button>
            )}
        </div>
      </div>
    </div>
  );
};
