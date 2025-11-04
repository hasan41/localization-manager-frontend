'use client';

import { useState, useEffect } from 'react';
import { ComponentEntry } from '../lib/database';
import { getAllComponents, deleteComponent } from '../lib/components-storage';

interface ComponentHistoryProps {
  onSelect: (component: ComponentEntry) => void;
  currentComponentId?: string;
  refreshTrigger?: number;
}

export default function ComponentHistory({ onSelect, currentComponentId, refreshTrigger }: ComponentHistoryProps) {
  const [components, setComponents] = useState<ComponentEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComponents();
  }, [refreshTrigger]);

  const loadComponents = async () => {
    try {
      const allComponents = await getAllComponents();
      setComponents(allComponents);
    } catch (error) {
      console.error('Failed to load components:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this component?')) return;

    try {
      await deleteComponent(id);
      setComponents(components.filter(c => c.id !== id));
    } catch (error) {
      console.error('Failed to delete component:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-400">Loading components...</p>
        </div>
      </div>
    );
  }

  if (components.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <p className="text-sm text-slate-400 font-medium">No saved components yet</p>
        <p className="text-xs text-slate-500 mt-2">Components will appear here after you save them</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
      <div className="p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <h3 className="font-bold text-slate-900 dark:text-white">
          Component History
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          {components.length} saved component{components.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {components.map((component, index) => (
          <div
            key={component.id}
            onClick={() => onSelect(component)}
            style={{ animationDelay: `${index * 50}ms` }}
            className={`group relative p-4 rounded-xl cursor-pointer transition-all duration-300 animate-fade-in ${
              currentComponentId === component.id
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 hover:shadow-md hover:scale-102'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${currentComponentId === component.id ? 'bg-white' : 'bg-gradient-to-r from-blue-500 to-purple-500'}`}></div>
                  <h4 className={`font-semibold truncate ${currentComponentId === component.id ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                    {component.name}
                  </h4>
                </div>
                {component.description && (
                  <p className={`text-sm line-clamp-2 mb-2 ${currentComponentId === component.id ? 'text-blue-100' : 'text-slate-600 dark:text-slate-400'}`}>
                    {component.description}
                  </p>
                )}
                <p className={`text-xs ${currentComponentId === component.id ? 'text-blue-200' : 'text-slate-400'}`}>
                  {new Date(component.updated_at || component.created_at!).toLocaleString()}
                </p>
              </div>
              <button
                onClick={(e) => handleDelete(component.id, e)}
                className={`ml-2 p-2 rounded-lg transition-all duration-200 ${
                  currentComponentId === component.id
                    ? 'hover:bg-white/20 text-white'
                    : 'hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-600'
                } opacity-0 group-hover:opacity-100`}
                title="Delete component"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
