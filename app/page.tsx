'use client';

import { useState } from 'react';
import SideNav from './components/SideNav';
import Editor from './components/Editor';
import LocalizationTable from './components/LocalizationTable';
import ComponentHistory from './components/ComponentHistory';
import { ComponentEntry } from './lib/database';

export default function Home() {
  const [currentPage, setCurrentPage] = useState<'editor' | 'localization'>('editor');
  const [selectedComponent, setSelectedComponent] = useState<ComponentEntry | null>(null);
  const [showHistory, setShowHistory] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSelectComponent = (component: ComponentEntry) => {
    setSelectedComponent(component);
    setCurrentPage('editor');
  };

  const handleComponentSaved = () => {
    // Trigger refresh of component history
    setRefreshTrigger(prev => prev + 1);
    setSelectedComponent(null);
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      <SideNav currentPage={currentPage} onPageChange={setCurrentPage} />

      <main className="flex-1 ml-64 flex">
        {/* Main content area */}
        <div className="flex-1 bg-white dark:bg-slate-900">
          {currentPage === 'editor' && (
            <Editor
              selectedComponent={selectedComponent}
              onComponentSaved={handleComponentSaved}
            />
          )}
          {currentPage === 'localization' && <LocalizationTable />}
        </div>

        {/* Component History Sidebar - only show on editor page */}
        {currentPage === 'editor' && showHistory && (
          <div className="w-80 border-l border-slate-200 dark:border-slate-700 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700">
              <h2 className="font-bold text-white">Components</h2>
              <button
                onClick={() => setShowHistory(false)}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-all duration-200"
                title="Hide sidebar"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <ComponentHistory
              onSelect={handleSelectComponent}
              currentComponentId={selectedComponent?.id}
              refreshTrigger={refreshTrigger}
            />
          </div>
        )}

        {/* Show history button when hidden */}
        {currentPage === 'editor' && !showHistory && (
          <button
            onClick={() => setShowHistory(true)}
            className="fixed right-6 top-6 p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-2xl hover:shadow-blue-500/50 hover:scale-110 transition-all duration-300 z-50 group"
            title="Show component history"
          >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
      </main>
    </div>
  );
}
