'use client';

import React, { useState, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import { useChat } from '@ai-sdk/react';
import ComponentPreview from './ComponentPreview';
import { ComponentEntry } from '../lib/database';
import { localizeComponent } from '../lib/localization-utils';
import { createComponent, updateComponent } from '../lib/components-storage';

interface EditorProps {
  selectedComponent?: ComponentEntry | null;
  onComponentSaved?: () => void;
}

export interface EditorHandle {
  handleSave: () => Promise<void>;
  isPreviewingGenerated: boolean;
  resetChat: () => void;
  hasUnsavedChanges: () => boolean;
}

const Editor = forwardRef<EditorHandle, EditorProps>(({ selectedComponent, onComponentSaved }, ref) => {
  const [input, setInput] = useState('');
  const { messages, sendMessage, setMessages } = useChat();
  const [currentComponent, setCurrentComponent] = useState<string>('');
  const [componentName, setComponentName] = useState<string>('');
  const [currentComponentId, setCurrentComponentId] = useState<string | null>(null);
  const [lastSavedCode, setLastSavedCode] = useState<string>('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [localizeStatus, setLocalizeStatus] = useState<'idle' | 'localizing' | 'success' | 'error'>('idle');

  // Check if there are unsaved changes
  const hasUnsavedChanges = useCallback(() => {
    // No component means no unsaved changes
    if (!currentComponent) return false;

    // If there's a component but it was never saved (no ID and not matching lastSavedCode)
    if (!currentComponentId && currentComponent !== lastSavedCode) return true;

    // If there's a saved component but the current code differs from last saved
    if (currentComponent !== lastSavedCode) return true;

    return false;
  }, [currentComponent, currentComponentId, lastSavedCode]);

  // Reset chat function
  const resetChat = useCallback(() => {
    setCurrentComponent('');
    setComponentName('');
    setCurrentComponentId(null);
    setLastSavedCode('');
    setInput('');
    setMessages([]); // Clear chat messages
  }, [setMessages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage({ text: `${input}` });
      setInput('');
    }
  };

  // Load selected component from history
  useEffect(() => {
    if (selectedComponent) {
      setCurrentComponent(selectedComponent.code);
      setComponentName(selectedComponent.name);
      setCurrentComponentId(selectedComponent.id);
      setLastSavedCode(selectedComponent.code); // Mark as saved when loading
    } else {
      setCurrentComponent('');
      setComponentName('');
      setCurrentComponentId(null);
      setLastSavedCode('');
    }
  }, [selectedComponent]);

  // Extract React component code from AI responses
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant') {
      const text = lastMessage.parts.find(part => part.type === 'text')?.text || '';
      // Look for React component code in code blocks
      const codeBlockRegex = /```(?:tsx?|jsx?|react)?\n([\s\S]*?)\n```/g;
      const matches = [...text.matchAll(codeBlockRegex)];
      if (matches.length > 0) {
        // Get the last code block (most recent component)
        const componentCode = matches[matches.length - 1][1];
        if (componentCode.includes('export default') || componentCode.includes('function') || componentCode.includes('const')) {
          setCurrentComponent(componentCode);
          setCurrentComponentId(null); // Clear ID since this is AI-generated new code
          // Extract component name from code
          const nameMatch = componentCode.match(/(?:function|const)\s+(\w+)/);
          if (nameMatch) {
            setComponentName(nameMatch[1]);
          }
        }
      }
    }
  }, [messages]);

  // Save component to database
  const handleSave = useCallback(async () => {
    if (!currentComponent || !componentName) {
      alert('No component to save');
      return;
    }
    setSaveStatus('saving');
    try {
      if (currentComponentId) {
        // Update existing component
        await updateComponent(currentComponentId, {
          name: componentName,
          code: currentComponent,
          description: `Updated component: ${componentName}`
        });
      } else {
        // Create new component
        const newId = await createComponent(
          componentName,
          currentComponent,
          `Generated component: ${componentName}`
        );
        setCurrentComponentId(newId);
      }
      setLastSavedCode(currentComponent); // Update last saved code
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
      if (onComponentSaved) {
        onComponentSaved();
      }
    } catch (error) {
      console.error('Save error:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, [currentComponent, componentName, currentComponentId, onComponentSaved]);

  // Expose handle and previewing flag
  useImperativeHandle(ref, () => ({
    handleSave,
    isPreviewingGenerated: !!currentComponent,
    resetChat,
    hasUnsavedChanges
  }), [currentComponent, handleSave, resetChat, hasUnsavedChanges]);

  // Localize component
  const handleLocalize = async () => {
    if (!currentComponent || !componentName) {
      alert('No component to localize');
      return;
    }
    setLocalizeStatus('localizing');
    try {
      const result = await localizeComponent(currentComponent, componentName);
      setCurrentComponent(result.code);
      setLocalizeStatus('success');
      setTimeout(() => setLocalizeStatus('idle'), 2000);
      console.log('Localization complete:', {
        extractedTexts: result.extractedTexts,
        keys: result.textToKeyMap
      });
    } catch (error) {
      console.error('Localization error:', error);
      setLocalizeStatus('error');
      setTimeout(() => setLocalizeStatus('idle'), 3000);
    }
  };

  return (
    <div className="flex h-full">
      {/* Chat Section */}
      <div className="w-1/2 flex flex-col relative">
        {/* Scrollable Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 pb-32">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">React Component Creator</h1>
              <p className="text-gray-600 dark:text-gray-400">Describe the React component you want to create, and I&apos;ll build it for you with a live preview. (Beta - may take a tries to get a successful preview.)</p>
            </div>
            {messages.length === 0 && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Try these examples:</h3>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div>• &quot;Create a modern button component with hover effects&quot;</div>
                  <div>• &quot;Build a user profile card with avatar and social links&quot;</div>
                  <div>• &quot;Make a responsive navigation menu&quot;</div>
                  <div>• &quot;Design a pricing card component&quot;</div>
                </div>
              </div>
            )}
            {messages.map((message, index) => (
              <div key={message.id} className="mb-6 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-3xl rounded-2xl px-5 py-4 shadow-md ${message.role === 'user' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white ml-12' : 'bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 text-slate-900 dark:text-white mr-12 border border-slate-200 dark:border-slate-600'}`}>
                    <div className={`text-xs font-bold mb-2 flex items-center gap-2 ${message.role === 'user' ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                      {message.role === 'user' ? (
                        <>
                          <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          You
                        </>
                      ) : (
                        <>
                          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                          </div>
                          AI Assistant
                        </>
                      )}
                    </div>
                    {message.parts.map((part, i) => {
                      switch (part.type) {
                        case 'text':
                          return (
                            <div key={`${message.id}-${i}`} className="whitespace-pre-wrap leading-relaxed">
                              {part.text}
                            </div>
                          );
                      }
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Fixed Chat Input */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-50 to-transparent dark:from-slate-900 p-6">
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSubmit}>
              <div className="relative flex items-end bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 rounded-2xl shadow-xl hover:shadow-2xl hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300">
                <textarea
                  className="flex-1 px-6 py-4 bg-transparent text-lg placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none resize-none min-h-[56px] max-h-32 overflow-y-auto text-slate-900 dark:text-white"
                  value={input}
                  placeholder="Describe your component..."
                  onChange={e => setInput(e.currentTarget.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  rows={1}
                  style={{ height: 'auto', minHeight: '56px' }}
                  onInput={e => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = Math.min(target.scrollHeight, 128) + 'px';
                  }}
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="mr-2 mb-2 p-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-slate-300 disabled:to-slate-300 dark:disabled:from-slate-600 dark:disabled:to-slate-600 text-white rounded-xl transition-all duration-300 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/50 hover:scale-110"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m22 2-7 20-4-9-9-4Z" />
                    <path d="M22 2 11 13" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* Preview Section */}
      <div className="w-1/2 border-l border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Preview Header with Actions */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 dark:text-white">{componentName || 'Component Preview'}</h2>
                  {currentComponent && (
                    <p className="text-xs text-slate-500">{currentComponent.split('\n').length} lines of code</p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={!currentComponent || saveStatus === 'saving'}
                className={`group relative px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 shadow-lg ${!currentComponent || saveStatus === 'saving' ? 'bg-slate-300 dark:bg-slate-600 text-slate-500 cursor-not-allowed' : saveStatus === 'success' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-green-500/30 scale-105' : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white hover:shadow-green-500/50 hover:scale-105'}`}
              >
                {saveStatus === 'saving' && (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                {saveStatus === 'success' && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {saveStatus === 'idle' && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                )}
                <span>{saveStatus === 'saving' ? 'Saving...' : saveStatus === 'success' ? 'Saved!' : 'Save'}</span>
              </button>
              <button
                onClick={handleLocalize}
                disabled={!currentComponent || localizeStatus === 'localizing'}
                className={`group relative px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 shadow-lg ${!currentComponent || localizeStatus === 'localizing' ? 'bg-slate-300 dark:bg-slate-600 text-slate-500 cursor-not-allowed' : localizeStatus === 'success' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-purple-500/30 scale-105' : 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white hover:shadow-purple-500/50 hover:scale-105'}`}
              >
                {localizeStatus === 'localizing' && (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                {localizeStatus === 'success' && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {localizeStatus === 'idle' && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                )}
                <span>{localizeStatus === 'localizing' ? 'Localizing...' : localizeStatus === 'success' ? 'Localized!' : 'Localize'}</span>
              </button>
            </div>
          </div>
        </div>
        {/* Preview Component */}
        <div className="flex-1 overflow-auto">
          <ComponentPreview componentCode={currentComponent} />
        </div>
      </div>
    </div>
  );
});

Editor.displayName = 'Editor';

export default Editor;