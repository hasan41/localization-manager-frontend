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
    <div className="flex h-screen">
      <SideNav currentPage={currentPage} onPageChange={setCurrentPage} />

      <main className="flex-1 ml-64 flex">
        {/* Main content area */}
        <div className="flex-1">
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
          <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-white">Components</h2>
              <button
                onClick={() => setShowHistory(false)}
                className="text-gray-400 hover:text-gray-600"
                title="Hide sidebar"
              >
                ✕
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
            className="fixed right-4 top-4 p-2 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600"
            title="Show component history"
          >
            📁
          </button>
        )}
      </main>
    </div>
  );
}
