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
      <div className="p-4 text-gray-500">
        Loading components...
      </div>
    );
  }

  if (components.length === 0) {
    return (
      <div className="p-4 text-gray-500 text-sm">
        <p>No saved components yet.</p>
        <p className="mt-2">Components will appear here after you save them.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Component History
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          {components.length} saved component{components.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {components.map(component => (
          <div
            key={component.id}
            onClick={() => onSelect(component)}
            className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
              currentComponentId === component.id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 dark:text-white truncate">
                  {component.name}
                </h4>
                {component.description && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {component.description}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(component.updated_at || component.created_at!).toLocaleString()}
                </p>
              </div>
              <button
                onClick={(e) => handleDelete(component.id, e)}
                className="ml-2 p-1 text-gray-400 hover:text-red-600 transition-colors"
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
