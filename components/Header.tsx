import React from 'react';

interface Props {
  onHistoryClick: () => void;
}

export const Header: React.FC<Props> = ({ onHistoryClick }) => {
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
            <h1 className="text-xl font-bold tracking-tight">Smart XPath Generator</h1>
            <p className="text-xs text-slate-400">Automated Selenium Locator Strategy</p>
          </div>
        </div>
        <div className="hidden md:flex space-x-6 text-sm font-medium text-slate-300">
          <button className="hover:text-white cursor-pointer transition focus:outline-none">Generator</button>
          <button onClick={onHistoryClick} className="hover:text-white cursor-pointer transition focus:outline-none flex items-center">
             History
          </button>
          <button className="hover:text-white cursor-pointer transition focus:outline-none">Settings</button>
        </div>
      </div>
    </header>
  );
};